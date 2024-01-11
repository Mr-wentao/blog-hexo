---
title: 使用kubeadm部署一套高可用k8s集群 for CentOS
abbrlink: b86d9e9f
cover: 'https://static.zahui.fan/images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - Linux
  - Container
  - Kubernetes
  - 配置记录
  - Docker
date: 2022-05-07 11:22:50
---

> 基于centos使用kubeadm搭建集群， [ubuntu部署文档](/posts/526ffc9a/), 有疑问的地方可以看[官方文档](https://kubernetes.io/zh/docs/setup/production-environment/tools/kubeadm/)

## 准备机器

> 我的机器详情如下, 配置至少为4C4G

| hostname | IP        | 作用                                  |
| -------- | --------- | ------------------------------------- |
| public   | 10.0.0.3  | ingress和apiserver的负载均衡，nfs存储 |
| master1  | 10.0.0.11 | k8s master节点                        |
| master2  | 10.0.0.12 | k8s master节点                        |
| master3  | 10.0.0.13 | k8s master节点                        |
| worker1  | 10.0.0.21 | k8s worker节点                        |
| worker2  | 10.0.0.22 | k8s worker节点                        |

每台机器都做域名解析，或者绑定hosts(可选但建议)

```bash
vim /etc/hosts

10.0.0.3  public kube-apiserver
10.0.0.11 master1
10.0.0.12 master2
10.0.0.13 master3
```

每台机器都关闭防火墙和SELinux

> 负载均衡机器必须要关闭,因为6443不是nginx的标准端口,会被selinux拦截, 防火墙也需要放行6443端口, 可以考虑直接关闭

```bash
sudo systemctl disable --now firewalld
setenforce 0
sed -i "s/^SELINUX=.*/SELINUX=disabled/g" /etc/selinux/config
```

## 基础环境配置

> 基础环境是不管master还是worker都需要的环境

1. 禁用swap
2. 确保每个节点上 MAC 地址和 product_uuid 的唯一性`sudo cat /sys/class/dmi/id/product_uuid`
3. 修改hostname
4. 允许 iptables 检查桥接流量

```bash
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

{% tabs runtime %}

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
# 卸载旧版本Docker
sudo yum remove docker \
        docker-client \
        docker-client-latest \
        docker-common \
        docker-latest \
        docker-latest-logrotate \
        docker-logrotate \
        docker-engine

# 安装docker仓库
sudo yum install -y yum-utils
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 安装containerd
sudo yum install containerd.io -y
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

```bash
sudo systemctl enable containerd
sudo systemctl restart containerd
```

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

```bash
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

```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
exclude=kubelet kubeadm kubectl
EOF

# 将 SELinux 设置为 permissive 模式（相当于将其禁用）
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

sudo yum install -y kubelet-1.21.10-0 kubeadm-1.21.10-0 kubectl-1.21.10-0 --disableexcludes=kubernetes

sudo systemctl enable --now kubelet
```

<!-- endtab -->

<!-- tab 使用阿里云镜像仓库 -->

```bash
# 创建仓库文件
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

setenforce 0

# 安装指定版本的kubeadm
yum install -y --nogpgcheck kubelet-1.21.10-0 kubeadm-1.21.10-0 kubectl-1.21.10-0

# 启动kubelet
systemctl enable --now kubelet
```

<!-- endtab -->
{% endtabs %}

## 准备负载均衡

在`public`机器上执行，负载均衡软件选一个就行了，以下二选一

{% tabs TabName %}

<!-- tab 使用haproxy做负载均衡 -->

```bash
yum install -y haproxy
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

{% tabs TabName %}

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

[常见问题](/posts/526ffc9a/#常见问题)