---
title: Kubeadm之单节点master升级高可用master
abbrlink: 34d8fad0
cover: 'https://static.zahui.fan/images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - Linux
  - Container
  - Kubernetes
  - 配置记录
date: 2022-05-15 16:56:08
---

单节点升级master总体来说就是两步， 先修改apiserver地址为负载均衡地址，然后添加新的master节点。

搭建集群的时候我们注意一下就可以减少后期维护的烦恼，比如：

1. 使用hostname而不是ip来作为kube-apiserver地址
2. 单节点也把负载均衡安排上

假设已经有一个没有负载均衡的单节点master，现在想将它切换为高可用集群，记录以下步骤：

## 部署负载均衡

参考[部署负载均衡](/posts/b86d9e9f/#%E5%87%86%E5%A4%87%E8%B4%9F%E8%BD%BD%E5%9D%87%E8%A1%A1)

## 更新证书

> 因为我们部署了负载均衡，所以需要通过负载均衡的地址来访问apiserver，因为证书是针对域名或者ip做的签名，如果ip变了证书就失效了，这也是为什么建议使用hostname来代替ip

如果你是用kubeadm init 来创建的集群，那么你需要导出一个kubeadm配置

```bash
kubectl -n kube-system get configmap kubeadm-config -o jsonpath='{.data.ClusterConfiguration}' > kubeadm.yaml
```

### 添加证书SANs信息

```yml
apiServer:
  certSANs:
  # 这里需要包含负载均衡、所有master节点的hostname和ip
  - kube-apiserver
  - m1
  - m2
  - m3
  - 10.0.0.3
  - 10.0.0.11
  - 10.0.0.12
  - 10.0.0.13
  extraArgs:
    authorization-mode: Node,RBAC
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta2
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controlPlaneEndpoint: kube-apiserver:6443  # 修改成负载均衡的地址
controllerManager: {}
dns:
  type: CoreDNS
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: k8s.gcr.io
kind: ClusterConfiguration
kubernetesVersion: v1.21.10
networking:
  dnsDomain: cluster.local
  podSubnet: 10.244.0.0/16
  serviceSubnet: 10.96.0.0/12
scheduler: {}
```

### 生成新的证书

备份旧证书

```bash
mv /etc/kubernetes/pki/apiserver.{crt,key} .

```

生成新的证书

```bash
kubeadm init phase certs apiserver --config kubeadm.yaml
```

验证证书，确定包含新添加的SAN列表

```bash
openssl x509 -in /etc/kubernetes/pki/apiserver.crt -text

...
DNS:apiserver-endpoint, DNS:kubernetes, DNS:kubernetes.default, DNS:kubernetes.default.svc, DNS:kubernetes.default.svc.cluster.local, DNS:m1, DNS:m2, DNS:m3, IP Address:10.96.0.1, IP Address:10.0.0.11, IP Address:10.0.0.3, IP Address:10.0.0.12, IP Address:10.0.0.13
...
```

重启apiserver

```bash
kubectl delete pod kube-controller-manager-m1 kube-controller-manager-m2
```

保存新的配置

这步操作其实是把kubeadm的配置给保存在集群中， 以后添加新的节点就会读取这个配置

```bash
kubeadm init phase upload-config kubeadm --config kubeadm.yaml
```

当然你也可以手动编辑configmap

## 更新配置

证书更新完成了，负载均衡也部署好了，接下来就需要把所有用到旧地址的组件配置修改成负载均衡的地址。

### kubelet.conf

```bash
vim /etc/kubernetes/kubelet.conf
...
    server: https://kube-apiserver:6443
  name: kubernetes
...

systemctl restart kubelet
```

### controller-manager.conf

```bash
vim /etc/kubernetes/controller-manager.conf
...
    server: https://kube-apiserver:6443
  name: kubernetes
...
```

重启kube-controller-manager

```bash
kubectl delete pod -n kube-system kube-controller-manager-m1 kube-controller-manager-m2
```

### scheduler.conf

vim /etc/kubernetes/scheduler.conf

```bash
...
    server: https://kube-apiserver:6443
  name: kubernetes
...
```

重启kube-scheduler

```bash
kubectl delete pod -n kube-system kube-scheduler-m1 kube-scheduler-m2
```

### kube-proxy

```bash
kubectl edit configmap kube-proxy -n kube-system
...
  kubeconfig.conf: |-
    apiVersion: v1
    kind: Config
    clusters:
    - cluster:
        certificate-authority: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        server: https://kube-apiserver:6443
      name: default
    contexts:
    - context:
        cluster: default
        namespace: default
        user: default
      name: default
...
```

重启kube-proxy

```bash
kubectl rollout restart daemonset kube-proxy -n kube-system
```

kubeconfig上面的地址也需要改，比如 `~/.kube/config` 和 `/etc/kubernetes/admin.conf`

```yml
...
    server: https://kube-apiserver:6443
  name: kubernetes
...
```

## 添加控制平面

添加控制平面(master)请查看：[kubeadm添加master节点](/posts/b86d9e9f/#%E8%8E%B7%E5%8F%96join%E5%91%BD%E4%BB%A4-%E5%A2%9E%E5%8A%A0%E6%96%B0%E7%9A%84%E8%8A%82%E7%82%B9)