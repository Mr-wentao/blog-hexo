---
title: Centos7下使用kubeadm搭建高可用k8s 1.28集群
cover: 'https://s3.babudiu.com/iuxt//images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - Linux
  - Container
  - Kubernetes
---

## 准备机器
```
这里不在赘述keeplived + nginx的方式创建高可用虚拟IP配置apiserver，只使用单台nginx作为apiserver
```

| hostname | IP        | 作用                                  |
| -------- | --------- | ------------------------------------- |
| nginx    | 172.31.23.101| apiserver的负载均衡          |
| k8s-master1  | 172.31.23.90 | k8s master节点               |
| k8s-master2  | 172.31.23.91 | k8s master节点               |
| k8s-master3  | 172.31.23.92 | k8s master节点               |
| k8s-node1  | 172.31.23.93 | k8s worker节点                    |

#### master节点绑定hosts（直接使用ip地址会有警告）

```bash
vim /etc/hosts
172.31.23.90 k8s-master1
172.31.23.91 k8s-master2
172.31.23.92 k8s-master3
```

关闭防火墙和SELinux

> 负载均衡机器必须要关闭,因为6443不是nginx的标准端口,会被selinux拦截, 防火墙也需要放行6443端口, 可以考虑直接关闭防火墙

#### 基础环境配置

```bash
关闭防火墙
systemctl stop firewalld
systemctl disable firewalld

关闭selinux
# 临时关闭
setenforce 0
# 永久关闭
sed -i 's/enforcing/disabled/' /etc/selinux/config

#禁用swap
swapoff -a #临时关闭
sed -i 's/.*swap.*/#&/' /etc/fstab #永久关闭

#主机时间保持同步
yum install ntpdate -y
# 设置时间同步服务器
ntpdate time.windows.com
#加入crontab
crontab -e
0 1 * * *   /usr/sbin/ntpdate time.windows.com

```

#### 必备三调参数：开启bridge网桥模式，关闭ipv6协议

```bash
cat > kubernetes.conf << EOF
net.bridge.bridge-nf-call-iptables=1
net.bridge.bridge-nf-call-ip6tables=1
net.ipv4.ip_forward=1
net.ipv4.tcp_tw_recycle=0
vm.swappiness=0 # 禁止使用swap空间，只有当系统OOM时才允许使用它
vm.overcommit_memory=1 # 不检查物理内存是否够用
vm.panic_on_oom=0 # 开启OOM
fs.inotify.max_user_instances=8192
fs.inotify.max_user_watches=1048576
fs.file-max=52706963
fs.nr_open=52706963
net.ipv6.conf.all.disable_ipv6=1
net.netfilter.nf_conntrack_max=2310720
EOF
sudo cp kubernetes.conf /etc/sysctl.d/kubernetes.conf
sudo sysctl -p /etc/sysctl.d/kubernetes.conf
```

#### 开启ipvs模式，增加pod调度访问效率

```bash
modprobe br_netfilter
cat > /etc/sysconfig/modules/ipvs.modules << EOF
#! /bin/bash
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack_ipv4
EOF
授权并验证
sudo chmod 755 /etc/sysconfig/modules/ipvs.modules && bash
sudo /etc/sysconfig/modules/ipvs.modules && lsmod | grep -e ip_vs -e nf_contrack_ipv4
```

#### 安装runtime

```bash
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
cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter


# 卸载旧版本Docker
sudo yum remove docker \
              docker-client \
              docker-client-latest \
              docker-common \
              docker-latest \
              docker-latest-logrotate \
              docker-logrotate \
              docker-engine

# 安装docker仓库 containerd没有单独的源，默认使用docker镜像源
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装containerd
sudo yum install containerd.io -y
```

#### 配置

从yum源安装的containerd默认禁用了cri，可以使用命令重新生成默认配置

```bash
containerd config default | sudo tee /etc/containerd/config.toml
```

vim  `/etc/containerd/config.toml`

runc 使用 systemd cgroup 驱动
```bash
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
...
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
   SystemdCgroup = true
```

修改sandbox_image镜像 根据安装k8s版本拉取的已有镜像版本来修改
```bash
sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.9"
```

配置registry.mirrors为阿里云镜像

```bash
[plugins."io.containerd.grpc.v1.cri".registry.mirrors]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]      
    endpoint = ["https://bqr1dr1n.mirror.aliyuncs.com"]      
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."k8s.gcr.io"]      
    endpoint = ["https://registry.aliyuncs.com/k8sxio"] 
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

### 安装kubeadm、kubelet 和 kubectl

```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
enabled=1
gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
exclude=kubelet kubeadm kubectl
EOF

# 查看可用的版本
yum list kubelet kubeadm kubectl  --showduplicates --disableexcludes=kubernetes

sudo yum install -y kubelet-1.28.2-0 kubeadm-1.28.2-0 kubectl-1.28.2-0 --disableexcludes=kubernetes

sudo systemctl enable --now kubelet
```

## 准备负载均衡

在`nginx`机器上执行

```bash
yum install -y nginx nginx-all-modules
```

`vim nginx.conf`

```conf
# 将server块监听80端口这一段删除
    server {
        listen       80;
        listen       [::]:80;
        server_name  _;
        root         /usr/share/nginx/html;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        error_page 404 /404.html;
        location = /404.html {
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
        }
    }


# 在文件最后添加
stream {
    include stream.conf;
}
```

然后`vim /etc/nginx/stream.conf`

```conf
upstream k8s-apiserver {
    server 172.31.23.90:6443;
    server 172.31.23.91:6443;
    server 172.31.23.92:6443;
}
server {
    listen 6443;
    proxy_connect_timeout 1s;
    proxy_pass k8s-apiserver;
}
```
启动nginx
```bash
systemctl start nginx
```

### 可在每个节点提前拉取镜像
```bash
kubeadm config images pull --kubernetes-version=v1.28.0 --image-repository=registry.aliyuncs.com/google_containers
```

## 创建集群

### kubeadm init

####创建初始化kubeadm文件
```bash
kubeadm config print init-defaults > kubeadm-config.yaml
```
####创建的yaml文件
```yaml
apiVersion: kubeadm.k8s.io/v1beta3
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 172.31.23.90 
  bindPort: 6443
nodeRegistration:
  criSocket: unix:///var/run/containerd/containerd.sock
  imagePullPolicy: IfNotPresent
  name: k8s-master1  # 初始化节点名称修改
  taints: null
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta3
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns: {}
etcd:
  local:
    dataDir: /var/lib/etcd
# 修改镜像仓库地址
imageRepository: registry.aliyuncs.com/google_containers
kind: ClusterConfiguration
kubernetesVersion: 1.28.0
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
  podSubnet: 10.244.0.0/16  # 增加pod网段
scheduler: {}
controlPlaneEndpoint: "172.31.23.101:6443" # 高可用apiserver地址
---
# 新增容器运行时
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
---
# 使用ipvs模式
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs
```
```
需要修改的地方
advertiseAddress 本地api地址
name 节点名称
imageRepository 镜像仓库地址
podSubnet  pod网段
controlPlaneEndpoint  高可用apiserver地址
新增cgroupDriver 和 ipvs
```

### 在master1上执行

```bash
sudo kubeadm init --config kubeadm-config.yaml --upload-cert

不使用配置文件init
kubeadm init \
--kubernetes-version 1.28.0 \
--control-plane-endpoint "172.31.23.101:6443" \
--upload-certs \
--service-cidr=10.96.0.0/12 \
--pod-network-cidr=10.244.0.0/16
--image-repository registry.aliyuncs.com/google_containers
--enable-ipvs
```


### 安装网络插件

```bash
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

### 获取join命令, 增加新的节点

#### node

> kubeadm init 后会把加入master节点和加入worker节点的命令输出在终端上, 有效期2小时, 如果超时，可以重新生成

生成添加命令:

```bash
kubeadm token create --print-join-command
```

#### master

1. 生成证书, 记录`certificate key`

    ```bash
    kubeadm init phase upload-certs --upload-cert
    ```

2. 获取加入命令

    ```bash
    kubeadm token create --print-join-command
    ```

3. 上面两步可以简化成

    ```bash
    echo "$(kubeadm token create --print-join-command) --control-plane --certificate-key $(kubeadm init phase upload-certs --upload-certs | tail -1)"
    ```


## 常见问题

[常见问题](/posts/526ffc9a/#常见问题)

### 如果默认使用了iptables模式想修改为kube-proxy代理模式

相比iptables，使用ipvs可以提供更好的性能
```bash
kubectl -n kube-system edit configmap kube-proxy
```

mode参数修改成ipvs

![image.png](https://s3.babudiu.com/iuxt//images/202312112232082.png)


```bash
kubectl -n kube-system rollout restart daemonset kube-proxy
```

查看kube-proxy日志，出现 Using ipvs Proxier 说明修改成功。
![image.png](https://s3.babudiu.com/iuxt//images/202312112236807.png)

### 如何移除节点

移除node节点

```bash
kubectl drain k8s-node1 --ignore-daemonsets
kubectl delete node k8s-node1
```

如果是master节点还需要移除etcd member
```bash
kubectl exec -it -n kube-system etcd-master1 -- /bin/sh

# 查看etcd member list
etcdctl --endpoints 127.0.0.1:2379 --cacert /etc/kubernetes/pki/etcd/ca.crt --cert /etc/kubernetes/pki/etcd/server.crt --key /etc/kubernetes/pki/etcd/server.key member list

# 通过ID来删除etcd member
etcdctl --endpoints 127.0.0.1:2379 --cacert /etc/kubernetes/pki/etcd/ca.crt --cert /etc/kubernetes/pki/etcd/server.crt --key /etc/kubernetes/pki/etcd/server.key member remove 12637f5ec2bd02b8
```
