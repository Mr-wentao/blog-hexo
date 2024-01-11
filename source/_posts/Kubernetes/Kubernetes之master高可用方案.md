---
title: Kubernetes之master高可用方案
abbrlink: 10cef768
cover: 'https://static.zahui.fan/images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - Kubernetes
  - k8s
  - HA
  - keepalived
date: 2022-03-14 20:50:24
---

之前一直用使用的负载方案是搭建一台负载均衡器，可以是haproxy或nginx或lvs，来将多个master节点的6443端口做个负载均衡，但是考虑到负载均衡也需要高可用，所以会引入类似keepalived的方案来解决问题。偶然看到了kubeasz这个开源项目，宣称解决了master高可用问题，部署了一遍发现并没有额外搭建负载均衡器，研究了一下，发现了另一种思路。

## 使用额外的负载均衡来做高可用

这种就是比较容易想到的一种方案，比如3个master节点，前面有一台负载均衡（nginx、haproxy、lvs）等，但是负载均衡本身就是一个单点故障，所以一般来说还需要另一台负载均衡，通过keepalived来实现VIP的切换
[使用Keepalived来实现Nginx高可用](/posts/0cebb8ae)

![针对master节点做负载均衡](https://static.zahui.fan/images/lb_keepalived.png)  

## 在master上使用vip

架构图如图所示， 使用keepalived维护vip，每台master节点上都运行着一个负载均衡

![在master上使用vip](https://static.zahui.fan/images/202207050032858.jpg)

> 抢占式 和 非抢占式的区别： 比如master1默认的权重（priority）高，vip当前在master1上， master1挂掉后vip会飘到master2上，那么如果master1恢复正常了，抢占式会重新将vip抢过来，再次绑定到master1上，非抢占式则保持在master2上，除非master2也出问题。

{% tabs TabName %}
<!-- tab keepalived非抢占式配置 -->

```conf
# 在master1执行
global_defs {
    script_user root            # 脚本执行者
    enable_script_security      # 标记脚本安全
}

vrrp_script check {
    script "killall -0 kube-apiserver"      # 脚本路径
    interval 2                              # 脚本执行间隔，单位s
    weight -20                              # -254-254之间，检测失败权重减少
}

vrrp_instance VI_1 {                        # 实例名
    state  BACKUP                           # 这个是初始的状态， MASTER 或者 BACKUP， 非抢占模式必须为 BACKUP
    interface ens32                         # 网卡
    virtual_router_id 251                   # ID主备需一致
    priority 100                            # 默认权重，3个节点保持不一致，并且MASTER最大，priority之间的差值要小于weight
    nopreempt                               # 设置非抢占模式，state必须设置为BACKUP才能生效

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456
    }
    track_script {
        check                               # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到keepalived-BACKUP上
    }
    unicast_src_ip 10.0.0.51                # 配置源地址的IP地址，自己的ip
    unicast_peer {
       10.0.0.52
       10.0.0.53                            # 配置其他keepalived节点
    }
    virtual_ipaddress {
        10.0.0.50 dev ens32                 # vip 和 网卡
    }
}
```

```conf
# 在master2上执行
global_defs {
    script_user root            # 脚本执行者
    enable_script_security      # 标记脚本安全
}

vrrp_script check {
    script "killall -0 kube-apiserver"      # 脚本路径
    interval 2                              # 脚本执行间隔，单位s
    weight -20                              # -254-254之间，检测失败权重减少
}

vrrp_instance VI_1 {                        # 实例名
    state  BACKUP                           # 这个是初始的状态， MASTER 或者 BACKUP， 非抢占模式必须为 BACKUP
    interface ens32
    virtual_router_id 251                   # ID主备需一致
    priority 99                             # 默认权重，3个节点保持不一致，并且MASTER最大，priority之间的差值要小于weight
    nopreempt                               # 设置非抢占模式，state必须设置为BACKUP才能生效

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456
    }
    track_script {
        check                               # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到keepalived-BACKUP上
    }
    unicast_src_ip 10.0.0.52                # 配置源地址的IP地址，自己的ip
    unicast_peer {
       10.0.0.51
       10.0.0.53                            # 配置其他keepalived节点
    }
    virtual_ipaddress {
        10.0.0.50 dev ens32                 # vip
    }
}
```

```conf
# 在master3执行
global_defs {
    script_user root            # 脚本执行者
    enable_script_security      # 标记脚本安全
}

vrrp_script check {
    script "killall -0 kube-apiserver"      # 脚本路径
    interval 2                              # 脚本执行间隔，单位s
    weight -20                              # -254-254之间，检测失败权重减少
}

vrrp_instance VI_1 {                        # 实例名
    state  BACKUP                           # 这个是初始的状态，MASTER 或者 BACKUP， 非抢占模式必须为 BACKUP
    interface ens32
    virtual_router_id 251                   # ID主备需一致
    priority  98                            # 默认权重，3个节点保持不一致，并且MASTER最大，priority之间的差值要小于weight
    nopreempt                               # 设置非抢占模式，state必须设置为BACKUP才能生效

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456
    }
    track_script {
        check                               # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到keepalived-BACKUP上
    }
    unicast_src_ip 10.0.0.53                # 配置源地址的IP地址，自己的ip
    unicast_peer {
       10.0.0.51
       10.0.0.52                            # 配置其他keepalived节点
    }
    virtual_ipaddress {
        10.0.0.50 dev ens32                 # vip
    }
}
```

<!-- endtab -->

<!-- tab keepalived抢占式配置 -->

```conf
# master1 节点配置
global_defs {
    script_user root                        # 脚本执行者
    enable_script_security                  # 标记脚本安全
}

vrrp_script check {
    script "killall -0 kube-apiserver"      # 脚本路径
    interval 2                              # 脚本执行间隔，单位s
    weight -20                              # -254-254之间，检测失败权重减少
}

vrrp_instance VI_1 {                        # 实例名
    state  MASTER                           # 3个实例，1个配置MASTER，另外2个配置BACKUP
    interface ens32
    virtual_router_id 251                   # ID主备需一致
    priority 100                            # 默认权重，3个节点保持不一致，并且MASTER最大，priority之间的差值要小于weight

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456
    }
    track_script {
        check                               # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到keepalived-BACKUP上
    }
    unicast_src_ip 10.0.0.51                # 配置源地址的IP地址，自己的ip
    unicast_peer {
       10.0.0.52
       10.0.0.53                            # 配置其他keepalived节点
    }
    virtual_ipaddress {
        10.0.0.50 dev ens32                 # vip
    }
}
```

```conf
# master2 节点配置
global_defs {
    script_user root            # 脚本执行者
    enable_script_security      # 标记脚本安全
}

vrrp_script check {
    script "killall -0 kube-apiserver"      # 脚本路径
    interval 2                              # 脚本执行间隔，单位s
    weight -20                              # -254-254之间，检测失败权重减少
}

vrrp_instance VI_1 {                        # 实例名
    state  BACKUP                           # 3个实例，1个配置MASTER，另外2个配置BACKUP
    interface ens32
    virtual_router_id 251                   # ID主备需一致
    priority 99                             # 默认权重，3个节点保持不一致，并且MASTER最大，priority之间的差值要小于weight

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456
    }
    track_script {
        check                               # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到keepalived-BACKUP上
    }
    unicast_src_ip 10.0.0.52                # 配置源地址的IP地址，自己的ip
    unicast_peer {
       10.0.0.51
       10.0.0.53                            # 配置其他keepalived节点
    }
    virtual_ipaddress {
        10.0.0.50 dev ens32                 # vip
    }
}
```

```conf
# master3 节点配置
global_defs {
    script_user root            # 脚本执行者
    enable_script_security      # 标记脚本安全
}

vrrp_script check {
    script "killall -0 kube-apiserver"      # 脚本路径
    interval 2                              # 脚本执行间隔，单位s
    weight -20                              # -254-254之间，检测失败权重减少
}

vrrp_instance VI_1 {                        # 实例名
    state  BACKUP                           # 3个实例，1个配置MASTER，另外2个配置BACKUP
    interface ens32
    virtual_router_id 251                   # ID主备需一致
    priority  98                            # 默认权重，3个节点保持不一致，并且MASTER最大，priority之间的差值要小于weight

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456
    }
    track_script {
        check                               # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到keepalived-BACKUP上
    }
    unicast_src_ip 10.0.0.53                # 配置源地址的IP地址，自己的ip
    unicast_peer {
       10.0.0.51
       10.0.0.52                            # 配置其他keepalived节点
    }
    virtual_ipaddress {
        10.0.0.50 dev ens32                 # vip
    }
}
```

<!-- endtab -->
{% endtabs %}


## 在每个节点上部署负载均衡

是看到了有些开源项目不用额外的负载均衡器也可以完成master高可用  
方案就是所有节点上安装负载均衡，架构图如下, 监听的是127.0.0.1:6443，所有的服务都连接127.0.0.1:6443端口，然后负载到3台master，这样不用担心负载均衡挂掉，挂掉也只会影响自己，缺点就是每台机器都需要额外部署服务，master节点发生变化后, 每台机器都需要更新负载均衡的配置。

![在worker节点搭建负载均衡](https://static.zahui.fan/images/worker_lb.jpg)  


### 安装集群的时候

安装集群的时候,指定apiserver为127.0.0.1

```bash
sudo kubeadm init \
--control-plane-endpoint "127.0.0.1:6443" \
--upload-certs \
--service-cidr=10.96.0.0/12 \
--pod-network-cidr=10.244.0.0/16
```

### 修改apiserver监听地址

apiserver默认监听的地址是 `*:6443`  需要修改成 `<主机IP>:6443`  这样Nginx才能监听 `127.0.0.1:6443`, 修改方式

```bash
vim /etc/kubernetes/manifests/kube-apiserver.yaml
```

启动参数增加 `--bind-address=10.0.0.11`

```yaml
spec:
  containers:
  - command:
    - kube-apiserver
    - --advertise-address=10.0.0.11
    - --allow-privileged=true
    - --authorization-mode=Node,RBAC
    - --client-ca-file=/etc/kubernetes/pki/ca.crt
    - --enable-admission-plugins=NodeRestriction
    - --enable-bootstrap-token-auth=true
    - --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt
    - --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt
    - --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key
    - --etcd-servers=https://127.0.0.1:2379
    - --kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt
    - --kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key
    - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
    - --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.crt
    - --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client.key
    - --requestheader-allowed-names=front-proxy-client
    - --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt
    - --requestheader-extra-headers-prefix=X-Remote-Extra-
    - --requestheader-group-headers=X-Remote-Group
    - --requestheader-username-headers=X-Remote-User
    - --secure-port=6443
    - --service-account-issuer=https://kubernetes.default.svc.cluster.local
    - --service-account-key-file=/etc/kubernetes/pki/sa.pub
    - --service-account-signing-key-file=/etc/kubernetes/pki/sa.key
    - --service-cluster-ip-range=10.96.0.0/12
    - --tls-cert-file=/etc/kubernetes/pki/apiserver.crt
    - --tls-private-key-file=/etc/kubernetes/pki/apiserver.key
    - --bind-address=10.0.0.11
    image: registry.k8s.io/kube-apiserver:v1.28.4
```



### 配置负载均衡

`Nginx` 和 `HAproxy` 选择一个就行, 所有master和worker节点都需要部署.

{% tabs TabName %}
<!-- tab 使用HAproxy -->

```conf
global
        log /dev/log    local1 warning
        chroot /var/lib/haproxy
        user haproxy
        group haproxy
        daemon
        nbproc 1

defaults
        log     global
        timeout connect 5s
        timeout client  10m
        timeout server  10m

listen kube_master
        bind 127.0.0.1:6443
        mode tcp
        option tcplog
        option dontlognull
        option dontlog-normal
        balance roundrobin
        server 192.168.13.117 192.168.13.117:6443 check inter 10s fall 2 rise 2 weight 1
        server 192.168.13.118 192.168.13.118:6443 check inter 10s fall 2 rise 2 weight 1
        server 192.168.13.119 192.168.13.119:6443 check inter 10s fall 2 rise 2 weight 1
```


<!-- endtab -->


<!-- tab 使用Nginx -->

```conf
user root;
worker_processes 1;

# 加载模块
include /usr/share/nginx/modules/*.conf;

error_log  /var/log/nginx/error.log warn;

events {
    worker_connections  3000;
}

stream {
    upstream backend {
        server 10.0.0.11:6443    max_fails=2 fail_timeout=3s;
        server 10.0.0.12:6443    max_fails=2 fail_timeout=3s;
        server 10.0.0.13:6443    max_fails=2 fail_timeout=3s;
    }

    server {
        listen 127.0.0.1:6443;
        proxy_connect_timeout 1s;
        proxy_pass backend;
    }
}
```


<!-- endtab -->
{% endtabs %}

查看监听端口, 此时可以正常启动 负载均衡了.

![image.png](https://static.zahui.fan/images/202311171817270.png)