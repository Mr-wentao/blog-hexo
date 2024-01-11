---
title: 二进制部署Kuberntes 1.17.2
categories:
  - Kubernetes
tags:
  - Kubernetes
  - 配置记录
  - keepalived
abbrlink: 67853ccb
date: 2023-06-13 17:53:43
---

## 一些基本信息

| 说明                     | IP/段         |
| ----------------------- | ------------- |
| SERVICE_CIDR            | 10.68.0.0/16  |
| CLUSTER_CIDR / Pod CIDR | 172.20.0.0/16 |
| master1                 | 10.0.0.51     |
| master2                 | 10.0.0.52     |
| master3                 | 10.0.0.53     |
| vip                     | 10.0.0.50     |
| 集群DNS的Cluster IP (kubelet需要配置) | 10.68.0.2 | 

## 高可用方案

高可用主要有以下几种方案：

1. keepalived飘一个VIP，这种方案只能起到高可用的作用，并不能为apiserver做负载，且不够优雅
2. 每个master节点部署一个负载均衡，后端配置的是所有的apiserver地址，然后使用keepalived飘一个VIP，这种方案和方案1效果类似，不过增加了负载均衡，可以分担单个apiserver的压力
3. 外置负载均衡的方式，一般也是两台haproxy或nginx，然后使用keepalived飘一个VIP，如果是云服务器，直接购买内网负载均衡吧，免费的
4. apiserver地址配置成127.0.0.1，然后每个节点（包括master和worker）都安装一个负载均衡，监听127.0.0.1，后端地址是所有apiserver地址。

{% tabs TabName %}
<!-- tab Keepalived + VIP -->

安装keepalived

```bash
apt update && apt install -y keepalived
```

生成配置文件

```bash
# 在master1执行
cat > /etc/keepalived/keepalived.conf <<'EOF'
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
EOF
```

```bash
# 在master2上执行
cat > /etc/keepalived/keepalived.conf <<'EOF'
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
EOF
```

```bash
# 在master3执行
cat > /etc/keepalived/keepalived.conf <<'EOF'
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
EOF
```

设置开机自启动

```bash
systemctl restart keepalived
systemctl enable --now keepalived
systemctl status keepalived
```

<!-- endtab -->

<!-- tab Keepalived + HAproxy -->
待有空补充
<!-- endtab -->
{% endtabs %}

## 系统环境配置

### 主机名配置

```bash
#参考设置主机名
hostnamectl set-hostname master1
​
#配置解析
cat >> /etc/hosts <<'EOF'
10.0.0.51  master1
10.0.0.52  master2
10.0.0.53  master3
EOF

```

### 系统环境优化

{% tabs TabName %}
<!-- tab CentOS -->

所有节点关闭firewalld，selinux，NetworkManager

```bash
systemctl disable --now firewalld 
systemctl disable --now NetworkManager
setenforce 0
sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/sysconfig/selinux
sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/selinux/config
```

所有节点配置ulimit

```bash
cat >> /etc/security/limits.conf <<'EOF'
* soft nofile 655360
* hard nofile 131072
* soft nproc 655350
* hard nproc 655350
* soft memlock unlimited
* hard memlock unlimited
EOF
```

<!-- endtab -->

<!-- tab Ubuntu -->

所有节点关闭防火墙

```bash
systemctl disable --now ufw
```

所有节点配置ulimit

```bash
cat >> /etc/security/limits.conf <<'EOF'
* soft nofile 655360
* hard nofile 131072
* soft nproc 655350
* hard nproc 655350
* soft memlock unlimited
* hard memlock unlimited
root soft nofile 655360
root hard nofile 131072
root soft nproc 655350
root hard nproc 655350
root soft memlock unlimited
root hard memlock unlimited
EOF
```
<!-- endtab -->
{% endtabs %}

所有节点关闭swap分区，fstab注释swap相关配置

```bash
swapoff -a && sysctl -w vm.swappiness=0
sed -ri '/^[^#]*swap/s@^@#@' /etc/fstab
free -h
```

Linux内核调优

```bash
cat > /etc/sysctl.d/k8s.conf <<'EOF'
net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv6.conf.all.disable_ipv6 = 1
fs.may_detach_mounts = 1
vm.overcommit_memory=1
vm.panic_on_oom=0
fs.inotify.max_user_watches=89100
fs.file-max=52706963
fs.nr_open=52706963
net.netfilter.nf_conntrack_max=2310720
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_intvl =15
net.ipv4.tcp_max_tw_buckets = 36000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_max_orphans = 327680
net.ipv4.tcp_orphan_retries = 3
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 16384
net.ipv4.ip_conntrack_max = 65536
net.ipv4.tcp_max_syn_backlog = 16384
net.ipv4.tcp_timestamps = 0
net.core.somaxconn = 16384
EOF
sysctl --system
```

手动加载模块

```bash
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack
```

创建要开机自动加载的模块配置文件

```bash
cat > /etc/modules-load.d/ipvs.conf << 'EOF'
ip_vs
ip_vs_lc
ip_vs_wlc
ip_vs_rr
ip_vs_wrr
ip_vs_lblc
ip_vs_lblcr
ip_vs_dh
ip_vs_sh
ip_vs_fo
ip_vs_nq
ip_vs_sed
ip_vs_ftp
ip_vs_sh
nf_conntrack
ip_tables
ip_set
xt_set
ipt_set
ipt_rpfilter
ipt_REJECT
ipip
EOF
```

查看模块是否加载

```bash
lsmod | grep --color=auto -e ip_vs -e nf_conntrack
```

> 在内核4.19+版本nf_conntrack_ipv4已经改为nf_conntrack，4.18以下版本使用nf_conntrack_ipv4即可

修改内核参数

```bash
cat > /etc/sysctl.d/k8s.conf <<EOF
net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-iptables = 1
vm.overcommit_memory = 1
vm.panic_on_oom = 0
fs.inotify.max_user_watches = 89100
fs.file-max = 52706963
fs.nr_open = 52706963
net.netfilter.nf_conntrack_max = 2310720
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_max_tw_buckets = 36000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_max_orphans = 327680
net.ipv4.tcp_orphan_retries = 3
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 16384
net.ipv4.tcp_max_syn_backlog = 16384
net.ipv4.tcp_timestamps = 0
net.core.somaxconn = 16384
net.ipv6.conf.all.disable_ipv6 = 0
net.ipv6.conf.default.disable_ipv6 = 0
net.ipv6.conf.lo.disable_ipv6 = 0
net.ipv6.conf.all.forwarding = 1
EOF
```

## 生成证书配置文件

```bash
mkdir -p ~/pki/
```

```bash
cat > ~/pki/etcd-ca-csr.json <<'EOF'
{
  "CN": "etcd",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "etcd",
      "OU": "Etcd Security"
    }
  ],
  "ca": {
    "expiry": "876000h"
  }
}

EOF

cat > ~/pki/ca-config.json <<'EOF'
{
  "signing": {
    "default": {
      "expiry": "876000h"
    },
    "profiles": {
      "kubernetes": {
        "usages": [
            "signing",
            "key encipherment",
            "server auth",
            "client auth"
        ],
        "expiry": "876000h"
      }
    }
  }
}

EOF

cat > ~/pki/etcd-csr.json <<'EOF'
{
  "CN": "etcd",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "etcd",
      "OU": "Etcd Security"
    }
  ]
}
EOF

cat > ~/pki/ca-csr.json <<'EOF'
{
  "CN": "kubernetes",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "Kubernetes",
      "OU": "Kubernetes-manual"
    }
  ],
  "ca": {
    "expiry": "876000h"
  }
}
EOF

cat > ~/pki/apiserver-csr.json <<'EOF'
{
  "CN": "kube-apiserver",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "Kubernetes",
      "OU": "Kubernetes-manual"
    }
  ]
}
EOF

cat > ~/pki/front-proxy-ca-csr.json <<'EOF'
{
  "CN": "kubernetes",
  "key": {
     "algo": "rsa",
     "size": 2048
  }
}
EOF

cat > ~/pki/front-proxy-client-csr.json <<'EOF'
{
  "CN": "front-proxy-client",
  "key": {
     "algo": "rsa",
     "size": 2048
  }
}
EOF

cat > ~/pki/manager-csr.json <<'EOF'
{
  "CN": "system:kube-controller-manager",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "system:kube-controller-manager",
      "OU": "Kubernetes-manual"
    }
  ]
}
EOF

cat > ~/pki/scheduler-csr.json <<'EOF'
{
  "CN": "system:kube-scheduler",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "system:kube-scheduler",
      "OU": "Kubernetes-manual"
    }
  ]
}
EOF

cat > ~/pki/admin-csr.json <<'EOF'
{
  "CN": "admin",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "system:masters",
      "OU": "Kubernetes-manual"
    }
  ]
}
EOF

cat > ~/pki/kube-proxy-csr.json <<'EOF'
{
  "CN": "system:kube-proxy",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "system:kube-proxy",
      "OU": "Kubernetes-manual"
    }
  ]
}
EOF
```

## 容器运行时安装

所有节点部署containerd环境

<https://github.com/containerd/containerd/releases/download/v1.7.2/cri-containerd-cni-1.7.2-linux-amd64.tar.gz>

{% tabs TabName %}
<!-- tab CentOS -->
待完善
<!-- endtab -->

<!-- tab Ubuntu -->

```bash
cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# 设置必需的 sysctl 参数，这些参数在重新启动后仍然存在。
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

# 应用 sysctl 参数而无需重新启动
sudo sysctl --system


# 安装依赖
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 信任密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加仓库
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装containerd
sudo apt update
sudo apt install -y containerd.io

# 修改配置
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml


sed -i 's/SystemdCgroup = .*/SystemdCgroup = true/g' /etc/containerd/config.toml

systemctl restart containerd && systemctl enable containerd
```
<!-- endtab -->

<!-- tab 二进制安装 -->
待完善
<!-- endtab -->
{% endtabs %}

## master节点组件安装

```bash
# 下载K8S，etcd的软件包
wget https://dl.k8s.io/v1.27.2/kubernetes-server-linux-amd64.tar.gz
wget https://github.com/etcd-io/etcd/releases/download/v3.5.8/etcd-v3.5.8-linux-amd64.tar.gz

# 解压K8S的二进制程序包到PATH环境变量路径
tar -xf kubernetes-server-linux-amd64.tar.gz  --strip-components=3 -C /usr/local/bin kubernetes/server/bin/kube{let,ctl,-apiserver,-controller-manager,-scheduler,-proxy}

# 解压etcd的二进制程序包到PATH环境变量路径
tar -xf etcd-v3.5.8-linux-amd64.tar.gz --strip-components=1 -C /usr/local/bin etcd-v3.5.8-linux-amd64/etcd{,ctl}

# 将组件发送到其他节点
MasterNodes='master2 master3'
WorkNodes='node1 node2'
for NODE in $MasterNodes; do echo $NODE; scp /usr/local/bin/kube{let,ctl,-apiserver,-controller-manager,-scheduler,-proxy} $NODE:/usr/local/bin/; scp /usr/local/bin/etcd* $NODE:/usr/local/bin/; done
for NODE in $WorkNodes; do scp /usr/local/bin/kube{let,-proxy} $NODE:/usr/local/bin/ ; done

# 查看kubernetes的版本
kube-apiserver --version
kube-controller-manager --version
kube-scheduler --version
etcdctl version
kubelet --version
kube-proxy --version
kubectl version

# 所有节点安装cni插件
mkdir -p /opt/cni/bin
<https://github.com/containernetworking/plugins/releases>

# 拷贝cni插件到其他节点
MasterNodes='master2 master3'
for NODE in $MasterNodes; do scp /opt/cni/bin/* $NODE:/opt/cni/bin/; done
```

## 生成K8S集群证书文件

```bash
# 所有节点创建kubernetes相关目录
mkdir -p /etc/kubernetes/pki
```

> 以下操作均在master1完成即可

### 下载证书管理工具

```bash
wget https://github.com/cloudflare/cfssl/releases/download/v1.6.4/cfssl_1.6.4_linux_amd64 -O /usr/local/bin/cfssl
wget https://github.com/cloudflare/cfssl/releases/download/v1.6.4/cfssljson_1.6.4_linux_amd64 -O /usr/local/bin/cfssljson

chmod +x /usr/local/bin/cfssl /usr/local/bin/cfssljson
```

### 生成etcd证书

```bash
# 生成etcd CA证书和CA证书的key
cd ~/pki
cfssl gencert -initca etcd-ca-csr.json | cfssljson -bare /etc/etcd/ssl/etcd-ca

# 颁发证书
cfssl gencert \
    -ca=/etc/etcd/ssl/etcd-ca.pem \
    -ca-key=/etc/etcd/ssl/etcd-ca-key.pem \
    -config=ca-config.json \
    -hostname=127.0.0.1,master1,master2,master3,10.0.0.51,10.0.0.52,10.0.0.53 \
    -profile=kubernetes \
    etcd-csr.json | cfssljson -bare /etc/etcd/ssl/etcd

# 将证书复制到其他节点
MasterNodes='master2 master3'
for NODE in $MasterNodes; do
  ssh $NODE "mkdir -p /etc/etcd/ssl"
  for FILE in etcd-ca-key.pem  etcd-ca.pem  etcd-key.pem  etcd.pem; do
    scp /etc/etcd/ssl/${FILE} $NODE:/etc/etcd/ssl/${FILE}
  done
done
```

### 生成k8s组件apiserver相关证书

```bash
# 生成kubernetes证书
cd ~/pki
cfssl gencert -initca ca-csr.json | cfssljson -bare /etc/kubernetes/pki/ca

# 生成apiserver的客户端证书
cfssl gencert   \
    -ca=/etc/kubernetes/pki/ca.pem   \
    -ca-key=/etc/kubernetes/pki/ca-key.pem   \
    -config=ca-config.json   \
    -hostname=10.68.0.1,10.0.0.50,127.0.0.1,kubernetes,kubernetes.default,kubernetes.default.svc,kubernetes.default.svc.cluster,kubernetes.default.svc.cluster.local,10.0.0.51,10.0.0.52,10.0.0.53   \
    -profile=kubernetes   \
    apiserver-csr.json | cfssljson -bare /etc/kubernetes/pki/apiserver

# 生成apiserver的聚合证书
cfssl gencert   \
    -initca front-proxy-ca-csr.json | cfssljson -bare /etc/kubernetes/pki/front-proxy-ca

cfssl gencert   \
    -ca=/etc/kubernetes/pki/front-proxy-ca.pem   \
    -ca-key=/etc/kubernetes/pki/front-proxy-ca-key.pem   \
    -config=ca-config.json   \
    -profile=kubernetes   \
    front-proxy-client-csr.json | cfssljson -bare /etc/kubernetes/pki/front-proxy-client
```

> 10.68.0.1 是 k8s apiserver 的 clusterip ，如果service网段不是这个，则需要更改  
> 创建证书的时候可以预留几个IP，以防未来增加master节点

### 生成controller manager相关证书

```bash
# 生成 controller-manager 的证书
cfssl gencert \
    -ca=/etc/kubernetes/pki/ca.pem \
    -ca-key=/etc/kubernetes/pki/ca-key.pem \
    -config=ca-config.json \
    -profile=kubernetes \
    manager-csr.json | cfssljson -bare /etc/kubernetes/pki/controller-manager

# set-cluster：设置一个集群项
kubectl config set-cluster kubernetes \
    --certificate-authority=/etc/kubernetes/pki/ca.pem \
    --embed-certs=true \
    --server=https://10.0.0.50:6443 \
    --kubeconfig=/etc/kubernetes/controller-manager.kubeconfig

# set-credentials 设置一个用户项
kubectl config set-credentials system:kube-controller-manager \
    --client-certificate=/etc/kubernetes/pki/controller-manager.pem \
    --client-key=/etc/kubernetes/pki/controller-manager-key.pem \
    --embed-certs=true \
    --kubeconfig=/etc/kubernetes/controller-manager.kubeconfig

# 设置一个环境项，一个上下文
kubectl config set-context system:kube-controller-manager@kubernetes \
    --cluster=kubernetes \
    --user=system:kube-controller-manager \
    --kubeconfig=/etc/kubernetes/controller-manager.kubeconfig

# 使用某个环境当做默认环境
kubectl config use-context system:kube-controller-manager@kubernetes \
    --kubeconfig=/etc/kubernetes/controller-manager.kubeconfig
```

### scheduler相关证书

```bash
cfssl gencert \
    -ca=/etc/kubernetes/pki/ca.pem \
    -ca-key=/etc/kubernetes/pki/ca-key.pem \
    -config=ca-config.json \
    -profile=kubernetes \
    scheduler-csr.json | cfssljson -bare /etc/kubernetes/pki/scheduler

kubectl config set-cluster kubernetes \
    --certificate-authority=/etc/kubernetes/pki/ca.pem \
    --embed-certs=true \
    --server=https://10.0.0.50:6443 \
    --kubeconfig=/etc/kubernetes/scheduler.kubeconfig

kubectl config set-credentials system:kube-scheduler \
    --client-certificate=/etc/kubernetes/pki/scheduler.pem \
    --client-key=/etc/kubernetes/pki/scheduler-key.pem \
    --embed-certs=true \
    --kubeconfig=/etc/kubernetes/scheduler.kubeconfig

kubectl config set-context system:kube-scheduler@kubernetes \
    --cluster=kubernetes \
    --user=system:kube-scheduler \
    --kubeconfig=/etc/kubernetes/scheduler.kubeconfig

kubectl config use-context system:kube-scheduler@kubernetes \
    --kubeconfig=/etc/kubernetes/scheduler.kubeconfig

```

### 生成admin的证书

```bash
cfssl gencert \
    -ca=/etc/kubernetes/pki/ca.pem \
    -ca-key=/etc/kubernetes/pki/ca-key.pem \
    -config=ca-config.json \
    -profile=kubernetes \
    admin-csr.json | cfssljson -bare /etc/kubernetes/pki/admin

kubectl config set-cluster kubernetes  \
    --certificate-authority=/etc/kubernetes/pki/ca.pem  \
    --embed-certs=true  \
    --server=https://10.0.0.50:6443  \
    --kubeconfig=/etc/kubernetes/admin.kubeconfig

kubectl config set-credentials kubernetes-admin \
    --client-certificate=/etc/kubernetes/pki/admin.pem  \
    --client-key=/etc/kubernetes/pki/admin-key.pem  \
    --embed-certs=true  \
    --kubeconfig=/etc/kubernetes/admin.kubeconfig

kubectl config set-context kubernetes-admin@kubernetes \
    --cluster=kubernetes  \
    --user=kubernetes-admin \
    --kubeconfig=/etc/kubernetes/admin.kubeconfig

kubectl config use-context kubernetes-admin@kubernetes --kubeconfig=/etc/kubernetes/admin.kubeconfig
```

### 创建ServiceAccount Key

```bash
# ServiceAccount是k8s一种认证方式，创建ServiceAccount的时候会创建一个与之绑定的secret，这个secret会生成一个token
openssl genrsa -out /etc/kubernetes/pki/sa.key 2048
openssl rsa -in /etc/kubernetes/pki/sa.key -pubout -out /etc/kubernetes/pki/sa.pub

# 发送证书至其他节点
for NODE in master2 master3; 
  do
    for FILE in $(ls /etc/kubernetes/pki | grep -v etcd); 
    do
      scp /etc/kubernetes/pki/${FILE} $NODE:/etc/kubernetes/pki/${FILE};
    done;
    for FILE in admin.kubeconfig controller-manager.kubeconfig scheduler.kubeconfig; 
    do
      scp /etc/kubernetes/${FILE} $NODE:/etc/kubernetes/${FILE};
    done;
done
```

## etcd安装配置

### master节点分别创建配置文件

```bash
# master1节点的配置文件
cat > /etc/etcd/etcd.config.yml <<'EOF'
name: 'master1'
data-dir: /var/lib/etcd
wal-dir: /var/lib/etcd/wal
snapshot-count: 5000
heartbeat-interval: 100
election-timeout: 1000
quota-backend-bytes: 0
listen-peer-urls: 'https://10.0.0.51:2380'
listen-client-urls: 'https://10.0.0.51:2379,http://127.0.0.1:2379'
max-snapshots: 3
max-wals: 5
cors:
initial-advertise-peer-urls: 'https://10.0.0.51:2380'
advertise-client-urls: 'https://10.0.0.51:2379'
discovery:
discovery-fallback: 'proxy'
discovery-proxy:
discovery-srv:
initial-cluster: 'master1=https://10.0.0.51:2380,master2=https://10.0.0.52:2380,master3=https://10.0.0.53:2380'
initial-cluster-token: 'etcd-k8s-cluster'
initial-cluster-state: 'new'
strict-reconfig-check: false
enable-v2: true
enable-pprof: true
proxy: 'off'
proxy-failure-wait: 5000
proxy-refresh-interval: 30000
proxy-dial-timeout: 1000
proxy-write-timeout: 5000
proxy-read-timeout: 0
client-transport-security:
  cert-file: '/etc/kubernetes/pki/etcd/etcd.pem'
  key-file: '/etc/kubernetes/pki/etcd/etcd-key.pem'
  client-cert-auth: true
  trusted-ca-file: '/etc/kubernetes/pki/etcd/etcd-ca.pem'
  auto-tls: true
peer-transport-security:
  cert-file: '/etc/kubernetes/pki/etcd/etcd.pem'
  key-file: '/etc/kubernetes/pki/etcd/etcd-key.pem'
  peer-client-cert-auth: true
  trusted-ca-file: '/etc/kubernetes/pki/etcd/etcd-ca.pem'
  auto-tls: true
debug: false
log-package-levels:
log-outputs: [default]
force-new-cluster: false
EOF
```

```bash
# master2节点的配置文件
cat > /etc/etcd/etcd.config.yml << 'EOF'
name: 'master2'
data-dir: /var/lib/etcd
wal-dir: /var/lib/etcd/wal
snapshot-count: 5000
heartbeat-interval: 100
election-timeout: 1000
quota-backend-bytes: 0
listen-peer-urls: 'https://10.0.0.52:2380'
listen-client-urls: 'https://10.0.0.52:2379,http://127.0.0.1:2379'
max-snapshots: 3
max-wals: 5
cors:
initial-advertise-peer-urls: 'https://10.0.0.52:2380'
advertise-client-urls: 'https://10.0.0.52:2379'
discovery:
discovery-fallback: 'proxy'
discovery-proxy:
discovery-srv:
initial-cluster: 'master1=https://10.0.0.51:2380,master2=https://10.0.0.52:2380,master3=https://10.0.0.53:2380'
initial-cluster-token: 'etcd-k8s-cluster'
initial-cluster-state: 'new'
strict-reconfig-check: false
enable-v2: true
enable-pprof: true
proxy: 'off'
proxy-failure-wait: 5000
proxy-refresh-interval: 30000
proxy-dial-timeout: 1000
proxy-write-timeout: 5000
proxy-read-timeout: 0
client-transport-security:
  cert-file: '/etc/kubernetes/pki/etcd/etcd.pem'
  key-file: '/etc/kubernetes/pki/etcd/etcd-key.pem'
  client-cert-auth: true
  trusted-ca-file: '/etc/kubernetes/pki/etcd/etcd-ca.pem'
  auto-tls: true
peer-transport-security:
  cert-file: '/etc/kubernetes/pki/etcd/etcd.pem'
  key-file: '/etc/kubernetes/pki/etcd/etcd-key.pem'
  peer-client-cert-auth: true
  trusted-ca-file: '/etc/kubernetes/pki/etcd/etcd-ca.pem'
  auto-tls: true
debug: false
log-package-levels:
log-outputs: [default]
force-new-cluster: false
EOF
```

```bash
# master3节点的配置文件
cat > /etc/etcd/etcd.config.yml << 'EOF'
name: 'master3'
data-dir: /var/lib/etcd
wal-dir: /var/lib/etcd/wal
snapshot-count: 5000
heartbeat-interval: 100
election-timeout: 1000
quota-backend-bytes: 0
listen-peer-urls: 'https://10.0.0.53:2380'
listen-client-urls: 'https://10.0.0.53:2379,http://127.0.0.1:2379'
max-snapshots: 3
max-wals: 5
cors:
initial-advertise-peer-urls: 'https://10.0.0.53:2380'
advertise-client-urls: 'https://10.0.0.53:2379'
discovery:
discovery-fallback: 'proxy'
discovery-proxy:
discovery-srv:
initial-cluster: 'master1=https://10.0.0.51:2380,master2=https://10.0.0.52:2380,master3=https://10.0.0.53:2380'
initial-cluster-token: 'etcd-k8s-cluster'
initial-cluster-state: 'new'
strict-reconfig-check: false
enable-v2: true
enable-pprof: true
proxy: 'off'
proxy-failure-wait: 5000
proxy-refresh-interval: 30000
proxy-dial-timeout: 1000
proxy-write-timeout: 5000
proxy-read-timeout: 0
client-transport-security:
  cert-file: '/etc/kubernetes/pki/etcd/etcd.pem'
  key-file: '/etc/kubernetes/pki/etcd/etcd-key.pem'
  client-cert-auth: true
  trusted-ca-file: '/etc/kubernetes/pki/etcd/etcd-ca.pem'
  auto-tls: true
peer-transport-security:
  cert-file: '/etc/kubernetes/pki/etcd/etcd.pem'
  key-file: '/etc/kubernetes/pki/etcd/etcd-key.pem'
  peer-client-cert-auth: true
  trusted-ca-file: '/etc/kubernetes/pki/etcd/etcd-ca.pem'
  auto-tls: true
debug: false
log-package-levels:
log-outputs: [default]
force-new-cluster: false
EOF
```

### 所有master节点启动etcd服务

创建systemd配置

```bash
cat > /usr/lib/systemd/system/etcd.service <<'EOF'
[Unit]
Description=Etcd Service
Documentation=https://coreos.com/etcd/docs/latest/
After=network.target

[Service]
Type=notify
ExecStart=/usr/local/bin/etcd --config-file=/etc/etcd/etcd.config.yml
Restart=on-failure
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
Alias=etcd3.service
EOF
```

启动服务

```bash
systemctl daemon-reload
systemctl enable --now etcd
systemctl status etcd
```

查看etcd状态

```bash
etcdctl --endpoints="10.0.0.51:2379,10.0.0.52:2379,10.0.0.53:2379" --cacert=/etc/kubernetes/pki/etcd/etcd-ca.pem --cert=/etc/kubernetes/pki/etcd/etcd.pem --key=/etc/kubernetes/pki/etcd/etcd-key.pem endpoint status --write-out=table
```

## master组件配置

```bash
# 所有节点执行
mkdir -p /etc/kubernetes/manifests/ /etc/systemd/system/kubelet.service.d /var/lib/kubelet /var/log/kubernetes
```

### 所有master节点配置Apiserver服务

```bash
# master1执行
cat > /usr/lib/systemd/system/kube-apiserver.service << 'EOF'
[Unit]
Description=Kubernetes API Server
Documentation=https://github.com/kubernetes/kubernetes
After=network.target

[Service]
ExecStart=/usr/local/bin/kube-apiserver \
      --v=2  \
      --allow-privileged=true  \
      --bind-address=0.0.0.0  \
      --secure-port=6443  \
      --advertise-address=10.0.0.51 \
      --service-cluster-ip-range=10.68.0.0/16  \
      --service-node-port-range=30000-32767  \
      --etcd-servers=https://10.0.0.51:2379,https://10.0.0.52:2379,https://10.0.0.53:2379 \
      --etcd-cafile=/etc/etcd/ssl/etcd-ca.pem  \
      --etcd-certfile=/etc/etcd/ssl/etcd.pem  \
      --etcd-keyfile=/etc/etcd/ssl/etcd-key.pem  \
      --client-ca-file=/etc/kubernetes/pki/ca.pem  \
      --tls-cert-file=/etc/kubernetes/pki/apiserver.pem  \
      --tls-private-key-file=/etc/kubernetes/pki/apiserver-key.pem  \
      --kubelet-client-certificate=/etc/kubernetes/pki/apiserver.pem  \
      --kubelet-client-key=/etc/kubernetes/pki/apiserver-key.pem  \
      --service-account-key-file=/etc/kubernetes/pki/sa.pub  \
      --service-account-signing-key-file=/etc/kubernetes/pki/sa.key  \
      --service-account-issuer=https://kubernetes.default.svc.cluster.local \
      --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname  \
      --enable-admission-plugins=NamespaceLifecycle,LimitRanger,ServiceAccount,DefaultStorageClass,DefaultTolerationSeconds,NodeRestriction,ResourceQuota  \
      --authorization-mode=Node,RBAC  \
      --enable-bootstrap-token-auth=true  \
      --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.pem  \
      --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.pem  \
      --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client-key.pem  \
      --requestheader-allowed-names=aggregator  \
      --requestheader-group-headers=X-Remote-Group  \
      --requestheader-extra-headers-prefix=X-Remote-Extra-  \
      --requestheader-username-headers=X-Remote-User 
      # --token-auth-file=/etc/kubernetes/token.csv  

Restart=on-failure
RestartSec=10s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

```bash
# master2执行
cat > /usr/lib/systemd/system/kube-apiserver.service <<'EOF'
[Unit]
Description=Kubernetes API Server
Documentation=https://github.com/kubernetes/kubernetes
After=network.target

[Service]
ExecStart=/usr/local/bin/kube-apiserver \
      --v=2  \
      --allow-privileged=true  \
      --bind-address=0.0.0.0  \
      --secure-port=6443  \
      --advertise-address=10.0.0.52 \
      --service-cluster-ip-range=10.68.0.0/16  \
      --service-node-port-range=30000-32767  \
      --etcd-servers=https://10.0.0.51:2379,https://10.0.0.52:2379,https://10.0.0.53:2379 \
      --etcd-cafile=/etc/etcd/ssl/etcd-ca.pem  \
      --etcd-certfile=/etc/etcd/ssl/etcd.pem  \
      --etcd-keyfile=/etc/etcd/ssl/etcd-key.pem  \
      --client-ca-file=/etc/kubernetes/pki/ca.pem  \
      --tls-cert-file=/etc/kubernetes/pki/apiserver.pem  \
      --tls-private-key-file=/etc/kubernetes/pki/apiserver-key.pem  \
      --kubelet-client-certificate=/etc/kubernetes/pki/apiserver.pem  \
      --kubelet-client-key=/etc/kubernetes/pki/apiserver-key.pem  \
      --service-account-key-file=/etc/kubernetes/pki/sa.pub  \
      --service-account-signing-key-file=/etc/kubernetes/pki/sa.key  \
      --service-account-issuer=https://kubernetes.default.svc.cluster.local \
      --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname  \
      --enable-admission-plugins=NamespaceLifecycle,LimitRanger,ServiceAccount,DefaultStorageClass,DefaultTolerationSeconds,NodeRestriction,ResourceQuota  \
      --authorization-mode=Node,RBAC  \
      --enable-bootstrap-token-auth=true  \
      --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.pem  \
      --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.pem  \
      --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client-key.pem  \
      --requestheader-allowed-names=aggregator  \
      --requestheader-group-headers=X-Remote-Group  \
      --requestheader-extra-headers-prefix=X-Remote-Extra-  \
      --requestheader-username-headers=X-Remote-User 
      # --token-auth-file=/etc/kubernetes/token.csv  

Restart=on-failure
RestartSec=10s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

```bash
# master3执行
cat > /usr/lib/systemd/system/kube-apiserver.service << 'EOF'
[Unit]
Description=Kubernetes API Server
Documentation=https://github.com/kubernetes/kubernetes
After=network.target

[Service]
ExecStart=/usr/local/bin/kube-apiserver \
      --v=2  \
      --allow-privileged=true  \
      --bind-address=0.0.0.0  \
      --secure-port=6443  \
      --advertise-address=10.0.0.53 \
      --service-cluster-ip-range=10.68.0.0/16  \
      --service-node-port-range=30000-32767  \
      --etcd-servers=https://10.0.0.51:2379,https://10.0.0.52:2379,https://10.0.0.53:2379 \
      --etcd-cafile=/etc/etcd/ssl/etcd-ca.pem  \
      --etcd-certfile=/etc/etcd/ssl/etcd.pem  \
      --etcd-keyfile=/etc/etcd/ssl/etcd-key.pem  \
      --client-ca-file=/etc/kubernetes/pki/ca.pem  \
      --tls-cert-file=/etc/kubernetes/pki/apiserver.pem  \
      --tls-private-key-file=/etc/kubernetes/pki/apiserver-key.pem  \
      --kubelet-client-certificate=/etc/kubernetes/pki/apiserver.pem  \
      --kubelet-client-key=/etc/kubernetes/pki/apiserver-key.pem  \
      --service-account-key-file=/etc/kubernetes/pki/sa.pub  \
      --service-account-signing-key-file=/etc/kubernetes/pki/sa.key  \
      --service-account-issuer=https://kubernetes.default.svc.cluster.local \
      --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname  \
      --enable-admission-plugins=NamespaceLifecycle,LimitRanger,ServiceAccount,DefaultStorageClass,DefaultTolerationSeconds,NodeRestriction,ResourceQuota  \
      --authorization-mode=Node,RBAC  \
      --enable-bootstrap-token-auth=true  \
      --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.pem  \
      --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.pem  \
      --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client-key.pem  \
      --requestheader-allowed-names=aggregator  \
      --requestheader-group-headers=X-Remote-Group  \
      --requestheader-extra-headers-prefix=X-Remote-Extra-  \
      --requestheader-username-headers=X-Remote-User 
      # --token-auth-file=/etc/kubernetes/token.csv  

Restart=on-failure
RestartSec=10s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

```bash
# 所有master节点执行
systemctl daemon-reload
systemctl enable --now kube-apiserver
systemctl status kube-apiserver
```

### 所有master节点配置ControllerManager服务

```bash
# 所有master节点创建配置文件
cat > /usr/lib/systemd/system/kube-controller-manager.service << 'EOF'
[Unit]
Description=Kubernetes Controller Manager
Documentation=https://github.com/kubernetes/kubernetes
After=network.target

[Service]
ExecStart=/usr/local/bin/kube-controller-manager \
    --v=2 \
    --bind-address=127.0.0.1 \
    --root-ca-file=/etc/kubernetes/pki/ca.pem \
    --cluster-signing-cert-file=/etc/kubernetes/pki/ca.pem \
    --cluster-signing-key-file=/etc/kubernetes/pki/ca-key.pem \
    --service-account-private-key-file=/etc/kubernetes/pki/sa.key \
    --kubeconfig=/etc/kubernetes/controller-manager.kubeconfig \
    --leader-elect=true \
    --use-service-account-credentials=true \
    --node-monitor-grace-period=40s \
    --node-monitor-period=5s \
    --controllers=*,bootstrapsigner,tokencleaner \
    --allocate-node-cidrs=true \
    --cluster-cidr=172.20.0.0/16 \
    --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.pem \
    --node-cidr-mask-size=24
      
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF

# 启动服务，查看状态
systemctl daemon-reload
systemctl enable --now kube-controller-manager
systemctl  status kube-controller-manager
```

### 所有master节点配置Scheduler服务

```bash
# 所有节点创建配置文件
cat > /usr/lib/systemd/system/kube-scheduler.service <<'EOF'
[Unit]
Description=Kubernetes Scheduler
Documentation=https://github.com/kubernetes/kubernetes
After=network.target

[Service]
ExecStart=/usr/local/bin/kube-scheduler \
    --v=2 \
    --bind-address=127.0.0.1 \
    --leader-elect=true \
    --kubeconfig=/etc/kubernetes/scheduler.kubeconfig

Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF

# 启动服务并查看状态，如上图所示
systemctl daemon-reload
systemctl enable --now kube-scheduler
systemctl  status kube-scheduler
```

## 创建Bootstrapping自动颁发证书

### master1节点创建bootstrap-kubelet.kubeconfig文件

```bash
cat > bootstrap.secret.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: bootstrap-token-c8ad9c
  namespace: kube-system
type: bootstrap.kubernetes.io/token
stringData:
  description: "The default bootstrap token generated by 'kubelet '."
  token-id: c8ad9c
  token-secret: 2e4d610cf3e7426e
  usage-bootstrap-authentication: "true"
  usage-bootstrap-signing: "true"
  auth-extra-groups:  system:bootstrappers:default-node-token,system:bootstrappers:worker,system:bootstrappers:ingress

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kubelet-bootstrap
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:node-bootstrapper
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: Group
  name: system:bootstrappers:default-node-token
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: node-autoapprove-bootstrap
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:certificates.k8s.io:certificatesigningrequests:nodeclient
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: Group
  name: system:bootstrappers:default-node-token
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: node-autoapprove-certificate-rotation
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:certificates.k8s.io:certificatesigningrequests:selfnodeclient
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: Group
  name: system:nodes
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
  name: system:kube-apiserver-to-kubelet
rules:
  - apiGroups:
      - ""
    resources:
      - nodes/proxy
      - nodes/stats
      - nodes/log
      - nodes/spec
      - nodes/metrics
    verbs:
      - "*"
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: system:kube-apiserver
  namespace: ""
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:kube-apiserver-to-kubelet
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: User
    name: kube-apiserver
EOF

kubectl config set-cluster kubernetes     \
  --certificate-authority=/etc/kubernetes/pki/ca.pem     \
  --embed-certs=true     \
  --server=https://10.0.0.50:6443     \
  --kubeconfig=/etc/kubernetes/bootstrap-kubelet.kubeconfig

# token 需要和上面的配置保持一致
kubectl config set-credentials tls-bootstrap-token-user     \
  --token=c8ad9c.2e4d610cf3e7426e \
  --kubeconfig=/etc/kubernetes/bootstrap-kubelet.kubeconfig

kubectl config set-context tls-bootstrap-token-user@kubernetes     \
  --cluster=kubernetes     \
  --user=tls-bootstrap-token-user     \
  --kubeconfig=/etc/kubernetes/bootstrap-kubelet.kubeconfig

kubectl config use-context tls-bootstrap-token-user@kubernetes --kubeconfig=/etc/kubernetes/bootstrap-kubelet.kubeconfig

# 创建bootstrap
kubectl create -f bootstrap.secret.yaml
```

## Kubelet配置

### 创建kubelet工作目录

```bash
mkdir -p /var/lib/kubelet /var/log/kubernetes /etc/systemd/system/kubelet.service.d /etc/kubernetes/manifests/
```

### 所有节点配置kubelet systemd service

```bash
cat >  /usr/lib/systemd/system/kubelet.service <<'EOF'
[Unit]
Description=Kubernetes Kubelet
Documentation=https://github.com/kubernetes/kubernetes
After=docker.service

[Service]
ExecStart=/usr/local/bin/kubelet \
  --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.kubeconfig \
  --kubeconfig=/etc/kubernetes/kubelet.kubeconfig \
  --config=/etc/kubernetes/kubelet-conf.yml \
  --pod-infra-container-image=registry.aliyuncs.com/google_containers/pause:3.6 \
  --runtime-request-timeout=15m  \
  --container-runtime-endpoint=unix:///run/containerd/containerd.sock \
  --node-labels=node.kubernetes.io/node=''
Restart=always
StartLimitInterval=0
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### 所有节点创建kubelet的配置文件

```bash
cat > /etc/kubernetes/kubelet-conf.yml <<'EOF'
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
address: 0.0.0.0
port: 10250
readOnlyPort: 10255
authentication:
  anonymous:
    enabled: false
  webhook:
    cacheTTL: 2m0s
    enabled: true
  x509:
    clientCAFile: /etc/kubernetes/pki/ca.pem
authorization:
  mode: Webhook
  webhook:
    cacheAuthorizedTTL: 5m0s
    cacheUnauthorizedTTL: 30s
cgroupDriver: systemd
cgroupsPerQOS: true
clusterDNS:
- 10.68.0.2
clusterDomain: cluster.local
containerLogMaxFiles: 5
containerLogMaxSize: 10Mi
contentType: application/vnd.kubernetes.protobuf
cpuCFSQuota: true
cpuManagerPolicy: none
cpuManagerReconcilePeriod: 10s
enableControllerAttachDetach: true
enableDebuggingHandlers: true
enforceNodeAllocatable:
- pods
eventBurst: 10
eventRecordQPS: 5
evictionHard:
  imagefs.available: 15%
  memory.available: 100Mi
  nodefs.available: 10%
  nodefs.inodesFree: 5%
evictionPressureTransitionPeriod: 5m0s
failSwapOn: true
fileCheckFrequency: 20s
hairpinMode: promiscuous-bridge
healthzBindAddress: 127.0.0.1
healthzPort: 10248
httpCheckFrequency: 20s
imageGCHighThresholdPercent: 85
imageGCLowThresholdPercent: 80
imageMinimumGCAge: 2m0s
iptablesDropBit: 15
iptablesMasqueradeBit: 14
kubeAPIBurst: 10
kubeAPIQPS: 5
makeIPTablesUtilChains: true
maxOpenFiles: 1000000
maxPods: 110
nodeStatusUpdateFrequency: 10s
oomScoreAdj: -999
podPidsLimit: -1
registryBurst: 10
registryPullQPS: 5
# resolvConf: /etc/resolv.conf
# 如果启用了systemd-resolved 需要修改为
resolvConf: /run/systemd/resolve/resolv.conf
rotateCertificates: true
runtimeRequestTimeout: 2m0s
serializeImagePulls: true
staticPodPath: /etc/kubernetes/manifests
streamingConnectionIdleTimeout: 4h0m0s
syncFrequency: 1m0s
volumeStatsAggPeriod: 1m0s
EOF
```

### 启动所有节点kubelet

```bash
systemctl daemon-reload
systemctl enable --now kubelet
systemctl status kubelet
```

## 安装kube-proxy

### 生成kube-proxy.kubeconfig配置文件

```bash
# 在master1上执行
cfssl gencert -ca=/etc/kubernetes/pki/ca.pem -ca-key=/etc/kubernetes/pki/ca-key.pem -config=ca-config.json -profile=kubernetes kube-proxy-csr.json | cfssljson -bare /etc/kubernetes/pki/kube-proxy

# 生成kubeconfig文件：
KUBE_CONFIG="/etc/kubernetes/kube-proxy.kubeconfig"
KUBE_APISERVER="https://10.0.0.50:6443"

kubectl config set-cluster kubernetes \
  --certificate-authority=/etc/kubernetes/pki/ca.pem \
  --embed-certs=true \
  --server=${KUBE_APISERVER} \
  --kubeconfig=${KUBE_CONFIG}

kubectl config set-credentials kube-proxy \
  --client-certificate=/etc/kubernetes/pki/kube-proxy.pem \
  --client-key=/etc/kubernetes/pki/kube-proxy-key.pem \
  --embed-certs=true \
  --kubeconfig=${KUBE_CONFIG}

kubectl config set-context default \
  --cluster=kubernetes \
  --user=kube-proxy \
  --kubeconfig=${KUBE_CONFIG}

kubectl config use-context default --kubeconfig=${KUBE_CONFIG}

# 在master1将kube-proxy的systemd Service文件发送到其他节点
for NODE in master2 master3; do
  scp /etc/kubernetes/kube-proxy.kubeconfig $NODE:/etc/kubernetes/kube-proxy.kubeconfig
done
```

### 生成kube-proxy配置文件

```bash
# 注意修改各个节点的"hostnameOverride"的值
cat > /etc/kubernetes/kube-proxy-config.yml << EOF
kind: KubeProxyConfiguration
apiVersion: kubeproxy.config.k8s.io/v1alpha1
bindAddress: 0.0.0.0
metricsBindAddress: 0.0.0.0:10249
clientConnection:
  kubeconfig: /etc/kubernetes/kube-proxy.kubeconfig
# 每个节点的名称都是不同的，注意修改
hostnameOverride: $HOSTNAME
clusterCIDR: 172.20.0.0/16
EOF
```

### 所有节点使用systemd管理kube-proxy

```bash
cat > /usr/lib/systemd/system/kube-proxy.service << EOF
[Unit]
Description=Kubernetes Proxy
After=network.target

[Service]
ExecStart=/usr/local/bin/kube-proxy --v=2 \
  --config=/etc/kubernetes/kube-proxy-config.yml
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
```

### 所有节点启动kube-proxy

```bash
systemctl daemon-reload
systemctl enable --now kube-proxy
systemctl status kube-proxy
```

## 检查master节点状态

到此master节点部署完成，在master1上查看node信息

```bash
kubectl get nodes
```

## 部署Node节点

### 分发证书

```bash
cd /etc/kubernetes/
for NODE in node1 node2; do
  ssh $NODE mkdir -p /etc/kubernetes/pki
  for FILE in pki/ca.pem pki/ca-key.pem pki/front-proxy-ca.pem bootstrap-kubelet.kubeconfig; do
    scp /etc/kubernetes/$FILE $NODE:/etc/kubernetes/${FILE}
  done
done

温馨提示:
  node节点使用自动颁发证书的形式配置
```

### 系统基础参数调整
参考 [系统环境优化](#系统环境优化)

### 容器运行时部署
参考 [容器运行时安装](#容器运行时安装)

### 部署 kube-proxy
[生成kube-proxy配置文件](#生成kube-proxy配置文件)
[所有节点使用systemd管理kube-proxy](#所有节点使用systemd管理kube-proxy)
[所有节点启动kube-proxy](#所有节点启动kube-proxy)

### 部署kubelet
参考 [Kubelet配置](#Kubelet配置)

## 部署网络插件

### 部署flannel网络插件

```bash
wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

  net-conf.json: |
    {
      "Network": "172.20.0.0/12", # 这里需要修改网段
      "Backend": {
        "Type": "vxlan"
      }
    }

# 创建flannel插件
kubectl apply -f kube-flannel.yml
```

### 观察各Pod状态

```bash
kubectl get pods -A -o wide
```

## 附加组件部署

### 部署coreDNS

```bash
cat > coredns.yaml <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: coredns
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
  name: system:coredns
rules:
  - apiGroups:
    - ""
    resources:
    - endpoints
    - services
    - pods
    - namespaces
    verbs:
    - list
    - watch
  - apiGroups:
    - discovery.k8s.io
    resources:
    - endpointslices
    verbs:
    - list
    - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
  name: system:coredns
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:coredns
subjects:
- kind: ServiceAccount
  name: coredns
  namespace: kube-system
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health {
          lameduck 5s
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
          fallthrough in-addr.arpa ip6.arpa
        }
        prometheus :9153
        forward . /etc/resolv.conf {
          max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coredns
  namespace: kube-system
  labels:
    k8s-app: kube-dns
    kubernetes.io/name: "CoreDNS"
    app.kubernetes.io/name: coredns
spec:
  # replicas: not specified here:
  # 1. Default is 1.
  # 2. Will be tuned in real time if DNS horizontal auto-scaling is turned on.
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  selector:
    matchLabels:
      k8s-app: kube-dns
      app.kubernetes.io/name: coredns
  template:
    metadata:
      labels:
        k8s-app: kube-dns
        app.kubernetes.io/name: coredns
    spec:
      priorityClassName: system-cluster-critical
      serviceAccountName: coredns
      tolerations:
        - key: "CriticalAddonsOnly"
          operator: "Exists"
      nodeSelector:
        kubernetes.io/os: linux
      affinity:
         podAntiAffinity:
           requiredDuringSchedulingIgnoredDuringExecution:
           - labelSelector:
               matchExpressions:
               - key: k8s-app
                 operator: In
                 values: ["kube-dns"]
             topologyKey: kubernetes.io/hostname
      containers:
      - name: coredns
        image: registry.cn-beijing.aliyuncs.com/dotbalo/coredns:1.9.4
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            memory: 170Mi
          requests:
            cpu: 100m
            memory: 70Mi
        args: [ "-conf", "/etc/coredns/Corefile" ]
        volumeMounts:
        - name: config-volume
          mountPath: /etc/coredns
          readOnly: true
        ports:
        - containerPort: 53
          name: dns
          protocol: UDP
        - containerPort: 53
          name: dns-tcp
          protocol: TCP
        - containerPort: 9153
          name: metrics
          protocol: TCP
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            add:
            - NET_BIND_SERVICE
            drop:
            - all
          readOnlyRootFilesystem: true
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 60
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 5
        readinessProbe:
          httpGet:
            path: /ready
            port: 8181
            scheme: HTTP
      dnsPolicy: Default
      volumes:
        - name: config-volume
          configMap:
            name: coredns
            items:
            - key: Corefile
              path: Corefile
---
apiVersion: v1
kind: Service
metadata:
  name: kube-dns
  namespace: kube-system
  annotations:
    prometheus.io/port: "9153"
    prometheus.io/scrape: "true"
  labels:
    k8s-app: kube-dns
    kubernetes.io/cluster-service: "true"
    kubernetes.io/name: "CoreDNS"
    app.kubernetes.io/name: coredns
spec:
  selector:
    k8s-app: kube-dns
    app.kubernetes.io/name: coredns
  clusterIP: 10.68.0.2
  ports:
  - name: dns
    port: 53
    protocol: UDP
  - name: dns-tcp
    port: 53
    protocol: TCP
  - name: metrics
    port: 9153
    protocol: TCP
EOF
```

```bash
kubectl create -f coredns.yaml
```

### 查看状态

```bash
kubectl get po -n kube-system -l k8s-app=kube-dns
```

### 验证CoreDNS

```bash
dig @10.68.0.2 kubernetes.default.svc.cluster.local +short
```


### 常见问题

Ubuntu里面无法启动CoreDNS：

<https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/dns-debugging-resolution/#known-issues>


## 其他

### 自动补全功能

{% tabs TabName %}
<!-- tab CentOS -->

```bash
yum -y install bash-completion
```

<!-- endtab -->


<!-- tab Ubuntu -->

```bash
apt install -y bash-completion
```

<!-- endtab -->
{% endtabs %}

```bash

cat >> ~/.bashrc <<'EOF'
source /usr/share/bash-completion/bash_completion
source <(kubectl completion bash)
EOF
```

### 测试集群是否正常

创建一个nginx的pod资源

```bash
kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get deploy,svc,pod
```

访问nodeport，检查能否访问到nginx服务
