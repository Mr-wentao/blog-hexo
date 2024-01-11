---
title: 使用kubeadm部署一套高可用k8s集群 for Ubuntu
abbrlink: 526ffc9a
categories:
  - Kubernetes
cover: 'https://static.zahui.fan/images/202211212221065.svg'
tags:
  - Linux
  - Container
  - Kubernetes
  - 配置记录
  - Docker
  - keepalived
date: 2021-05-01 17:18:48
---

> 基于ubuntu使用kubeadm搭建集群， [centos部署文档](/posts/b86d9e9f/), 有疑问的地方可以看[官方文档](https://kubernetes.io/zh/docs/setup/production-environment/tools/kubeadm/)

## 准备机器

> 我的机器详情如下, 配置至少为4C4G

| hostname | IP        | 作用                                |
| -------- | --------- | ----------------------------------- |
| public   | 10.0.0.3  | ingress、apiserver负载均衡，nfs存储 |
| master1  | 10.0.0.11 | k8s master节点                      |
| master2  | 10.0.0.12 | k8s master节点                      |
| master3  | 10.0.0.13 | k8s master节点                      |
| worker1    | 10.0.0.21 | k8s worker节点                        |
| worker2    | 10.0.0.22 | k8s worker节点                        |

每台机器都做域名解析，或者绑定hosts(可选但建议)

```bash
vim /etc/hosts

10.0.0.3  public kube-apiserver
10.0.0.11 master1
10.0.0.12 master2
10.0.0.13 master3
```

## 基础环境配置

> 基础环境是不管master还是worker都需要的环境

1. 禁用swap
2. 确保每个节点上 MAC 地址和 product_uuid 的唯一性`sudo cat /sys/class/dmi/id/product_uuid`
3. 修改hostname
4. 允许 iptables 检查桥接流量
5. 关闭防火墙

```bash
sudo systemctl disable --now ufw

cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sudo sysctl --system
```

### 安装runtime

{% tabs TabName %}

<!-- tab Containerd -->

#### 先决条件

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
```

#### 安装

```bash
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
```

#### 配置

生成默认配置

```bash
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
```

结合 runc 使用 systemd cgroup 驱动，在 `/etc/containerd/config.toml` 中设置

```toml
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
...
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
   SystemdCgroup = true
```

`sudo systemctl restart containerd`

#### crictl 配置

之前使用docker的时候，docker给我们做了很多好用的工具，现在用了containerd，管理容器我们用cri管理工具crictl，创建配置文件

vim /etc/crictl.yaml

```yaml
runtime-endpoint: unix:///run/containerd/containerd.sock
debug: false
```

<!-- endtab -->

<!-- tab Docker -->
#### 安装Docker

```bash
curl -fsSL get.docker.com | bash
```

#### 配置Doker

```json
sudo mkdir /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl enable --now docker
```

<!-- endtab -->
{% endtabs %}

### 安装kubeadm、kubelet 和 kubectl

{% tabs TabName %}

<!-- tab 使用官方仓库 -->

> 这一步需要科学上网, 不能科学上网的可以看看国内的源。

更新 apt 包索引并安装使用 Kubernetes apt 仓库所需要的包：

```bash
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl
```

下载 Google Cloud 公开签名秘钥：

```bash
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg
```

添加 Kubernetes apt 仓库：

```bash
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

更新 apt 包索引，安装 kubelet、kubeadm 和 kubectl，并锁定其版本：

```bash
sudo apt update

# 查看可用的版本号
sudo apt-cache madison kubeadm
sudo apt install -y kubeadm=1.21.10-00 kubelet=1.21.10-00 kubectl=1.21.10-00

# 锁定版本，不随 apt upgrade 更新
sudo apt-mark hold kubelet kubeadm kubectl
```

<!-- endtab -->

<!-- tab 使用阿里云镜像仓库 -->

```bash
apt-get update && apt-get install -y apt-transport-https

curl https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | apt-key add - 

cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF

# 查看可用的版本号
sudo apt-cache madison kubeadm

# 安装指定版本
sudo apt install -y kubeadm=1.21.10-00 kubelet=1.21.10-00 kubectl=1.21.10-00

# 安装最新版本
# sudo apt install -y kubeadm kubelet kubectl

# 锁定版本，不随 apt upgrade 更新
sudo apt-mark hold kubelet kubeadm kubectl
```

<!-- endtab -->
{% endtabs %}

## 准备负载均衡

在`public`机器上执行，负载均衡软件选一个就行了，以下二选一

{% tabs 准备负载均衡 %}

<!-- tab 使用VIP做高可用 -->

```bash
ip addr add 10.0.0.3 dev eth0
```

master节点都就绪后再部署keepalived来自动管理VIP，keepalived配置如下，不同master节点稍作修改

```bash
global_defs {
    script_user root                        # 脚本执行者
    enable_script_security                  # 标记脚本安全
}

vrrp_script check {
    script "killall -0 kube-apiserver"  # 检测apiserver进程
    interval 5                              # 脚本执行间隔，单位s
    weight -5                               # -254-254之间，检测失败权重减少，最大权重减去weight要比最小权重小。
}

vrrp_instance VI_1 {                        # 实例名
    state BACKUP                            # 所有节点BACKUP，设置非抢占模式
    nopreempt                               # 非抢占模式
    interface eth0
    virtual_router_id 251                   # ID主备需一致
    priority 100                            # 默认权重，另外两个节点设置成99、98

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456
    }
    track_script {
        check                               # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到其他keepalived节点上
    }
    unicast_src_ip 10.0.0.11                # 配置源地址的IP地址，自己的ip
    unicast_peer {
       10.0.0.12                            # 配置其他keepalived节点
       10.0.0.13                            # 配置其他keepalived节点
    }
    virtual_ipaddress {
        10.0.0.3 dev eth0                   # vip地址和绑定的网卡
    }
}
```

<!-- endtab -->

<!-- tab 使用haproxy做负载均衡 -->

```bash
apt install -y haproxy
```

```conf
--- 前面保持默认配置 ---

frontend k8s_api_fe
    bind :6443
    default_backend k8s_api_be
    mode tcp
    option tcplog
backend k8s_api_be
    balance source
    mode tcp
    server      master1 master1:6443 check
    server      master2 master2:6443 check
    server      master3 master3:6443 check

frontend http_ingress_traffic_fe
    bind :80
    default_backend http_ingress_traffic_be
    mode tcp
    option tcplog
backend http_ingress_traffic_be
    balance source
    mode tcp
    server      worker1 10.0.0.21:30080 check   # 这里需要更改成ingress的NodePort
    server      worker2 10.0.0.22:30080 check   # 这里需要更改成ingress的NodePort

frontend https_ingress_traffic_fe
    bind *:443
    default_backend https_ingress_traffic_be
    mode tcp
    option tcplog
backend https_ingress_traffic_be
    balance source
    mode tcp
    server      worker1 10.0.0.21:30443 check   # 这里需要更改成ingress的NodePort
    server      worker2 10.0.0.22:30443 check   # 这里需要更改成ingress的NodePort
```

<!-- endtab -->

<!-- tab 使用Nginx做负载均衡 -->

`vim nginx.conf` 在文件最后添加

```conf
stream {
    include stream.conf;
}
```

然后`vim /etc/nginx/stream.conf`

```conf
upstream k8s-apiserver {
    server master1:6443;
    server master2:6443;
    server master3:6443;
}
server {
    listen 6443;
    proxy_connect_timeout 1s;
    proxy_pass k8s-apiserver;
}

upstream ingress-http {
    server 10.0.0.21:30080;   # 这里需要更改成ingress的NodePort
    server 10.0.0.22:30080;   # 这里需要更改成ingress的NodePort
}
server {
    listen 80;
    proxy_connect_timeout 1s;
    proxy_pass ingress-http;
}

upstream ingress-https {
    server 10.0.0.21:30443;   # 这里需要更改成ingress的NodePort
    server 10.0.0.22:30443;   # 这里需要更改成ingress的NodePort
}
server {
    listen 443;
    proxy_connect_timeout 1s;
    proxy_pass ingress-https;
}
```

因为我们用nginx四层负载ingress，需要监听80端口，与nginx默认的端口监听冲突，所以需要删除默认的配置文件

```bash
rm -f /etc/nginx/sites-enabled/default
```

<!-- endtab -->
{% endtabs %}

## 创建集群

### kubeadm init

{% tabs TabName %}

<!-- tab 官方镜像源 -->

在init之前先将镜像拉取到本地（可选步骤）

```bash
kubeadm config images pull --kubernetes-version 1.21.10
```

在k8s-master0上执行

```bash
sudo kubeadm init \
--kubernetes-version 1.21.10 \
--control-plane-endpoint "kube-apiserver:6443" \
--upload-certs \
--service-cidr=10.96.0.0/12 \
--pod-network-cidr=10.244.0.0/16
```

<!-- endtab -->

<!-- tab 国内阿里云镜像源 -->

在init之前先将镜像拉取到本地（可选步骤）

```bash
kubeadm config images pull --kubernetes-version 1.21.10 --image-repository registry.cn-hangzhou.aliyuncs.com/google_containers
```

在k8s-master0上执行

```bash
sudo kubeadm init \
--kubernetes-version 1.21.10 \
--control-plane-endpoint "kube-apiserver:6443" \
--image-repository registry.cn-hangzhou.aliyuncs.com/google_containers \
--upload-certs \
--service-cidr=10.96.0.0/12 \
--pod-network-cidr=10.244.0.0/16
```

<!-- endtab -->
{% endtabs %}

> 也可以用`kubeadm config print init-defaults > init.yaml` 生成kubeadm的配置，并用
> `kubeadm init --config=init.yaml`来创建集群。

### 安装网络插件

{% tabs 网络插件 %}

<!-- tab 安装flannel插件 -->

```bash
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

<!-- endtab -->

<!-- tab 安装calico插件 -->

```bash
待补充
```

<!-- endtab -->
{% endtabs %}

### 获取join命令, 增加新的节点

#### node

> kubeadm init 后会输出在终端上, 有效期2小时, 超时后可以重新生成

生成添加命令:

```bash
kubeadm token create --print-join-command
```

#### master

1. 生成证书, 记录`certificate key`

    ```bash
    kubeadm init phase upload-certs --upload-certs
    ```

2. 获取加入命令

    ```bash
    kubeadm token create --print-join-command
    ```

3. 上面两步可以简化成

    ```bash
    echo "$(kubeadm token create --print-join-command) --control-plane --certificate-key $(kubeadm init phase upload-certs --upload-certs | tail -1)"
    ```

## 移除节点

移除节点

```bash
kubectl drain worker2 --ignore-daemonsets
kubectl delete node worker2
```

如果是master节点还需要移除etcd member

```bash
kubectl exec -it -n kube-system etcd-master1 -- /bin/sh

# 查看etcd member list
etcdctl --endpoints 127.0.0.1:2379 --cacert /etc/kubernetes/pki/etcd/ca.crt --cert /etc/kubernetes/pki/etcd/server.crt --key /etc/kubernetes/pki/etcd/server.key member list

# 通过ID来删除etcd member
etcdctl --endpoints 127.0.0.1:2379 --cacert /etc/kubernetes/pki/etcd/ca.crt --cert /etc/kubernetes/pki/etcd/server.crt --key /etc/kubernetes/pki/etcd/server.key member remove 12637f5ec2bd02b8
```

## 常见问题

### 一个比较奇怪的初始化失败问题

kubeadm有个坑的地方，使用`kubeadm image pull`可以事先把镜像拉取下来，但是后面`kubeadm init`会报错：

```bash
> journalctl -xeu kubelet -f

Jul 22 08:35:49 master1 kubelet[2079]: E0722 08:35:49.169395    2079 pod_workers.go:190] "Error syncing pod, skipping" err="failed to \"CreatePodSandbox\" for \"etcd-master1_kube-system(642dcd53ce8660a2287cd7eaabcd5fdc)\" with CreatePodSandboxError: \"Failed to create sandbox for pod \\\"etcd-master1_kube-system(642dcd53ce8660a2287cd7eaabcd5fdc)\\\": rpc error: code = Unknown desc = failed to get sandbox image \\\"k8s.gcr.io/pause:3.6\\\": failed to pull image \\\"k8s.gcr.io/pause:3.6\\\": failed to pull and unpack image \\\"k8s.gcr.io/pause:3.6\\\": failed to resolve reference \\\"k8s.gcr.io/pause:3.6\\\": failed to do request: Head \\\"https://k8s.gcr.io/v2/pause/manifests/3.6\\\": dial tcp 142.250.157.82:443: connect: connection refused\"" pod="kube-system/etcd-master1" podUID=642dcd53ce8660a2287cd7eaabcd5fdc
```

这里我们已经提前拉取了镜像在本地了， 但是init的时候还是会从`gcr.io`拉取镜像，造成init失败，如果网络条件比较好的情况下则可以完成初始化。比较坑的地方就是哪怕你指定了阿里云的镜像源，init的过程都会通过gcr.io拉取镜像。所以需要手动拉取镜像到本地, 再次init

这是init前

```bash
root@master1:~# crictl images
IMAGE                                TAG                 IMAGE ID            SIZE
k8s.gcr.io/coredns/coredns           v1.8.0              296a6d5035e2d       12.9MB
k8s.gcr.io/etcd                      3.4.13-0            0369cf4303ffd       86.7MB
k8s.gcr.io/kube-apiserver            v1.21.10            704b64a9bcd2f       30.5MB
k8s.gcr.io/kube-controller-manager   v1.21.10            eeb3ff9374071       29.5MB
k8s.gcr.io/kube-proxy                v1.21.10            ab8993ba3211b       35.9MB
k8s.gcr.io/kube-scheduler            v1.21.10            2f776f4731317       14.6MB
k8s.gcr.io/pause                     3.4.1               0f8457a4c2eca       301kB
```

init后

```bash
root@master1:~# crictl images
IMAGE                                TAG                 IMAGE ID            SIZE
k8s.gcr.io/coredns/coredns           v1.8.0              296a6d5035e2d       12.9MB
k8s.gcr.io/etcd                      3.4.13-0            0369cf4303ffd       86.7MB
k8s.gcr.io/kube-apiserver            v1.21.10            704b64a9bcd2f       30.5MB
k8s.gcr.io/kube-controller-manager   v1.21.10            eeb3ff9374071       29.5MB
k8s.gcr.io/kube-proxy                v1.21.10            ab8993ba3211b       35.9MB
k8s.gcr.io/kube-scheduler            v1.21.10            2f776f4731317       14.6MB
k8s.gcr.io/pause                     3.4.1               0f8457a4c2eca       301kB
k8s.gcr.io/pause                     3.6                 6270bb605e12e       302kB              # 增加了这个image
```

### 修改NodePort端口范围

在master节点上修改:

vim /etc/kubernetes/manifests/kube-apiserver.yaml

```yml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    kubeadm.kubernetes.io/kube-apiserver.advertise-address.endpoint: 10.0.0.22:6443
  creationTimestamp: null
  labels:
    component: kube-apiserver
    tier: control-plane
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - command:
    - kube-apiserver
    - --advertise-address=10.0.0.22
    - --allow-privileged=true
    ...
    # 增加了这一行
    - --service-node-port-range=1-65535
    image: registry.k8s.io/kube-apiserver:v1.27.3
    imagePullPolicy: IfNotPresent
    livenessProbe:
      failureThreshold: 8
      httpGet:
        host: 10.0.0.22
        path: /livez
```

修改完成后保存, apiserver会自动重启.

### master节点允许调度

ubuntu 是我的节点名字

```bash
# kubectl taint node ubuntu node-role.kubernetes.io/master:NoSchedule-

# 1.28版本 去掉master上的这个污点即可
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```
