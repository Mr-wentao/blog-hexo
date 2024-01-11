---
title: Ubuntu_Charmed_Kubernetes
abbrlink: efee88da
categories:
  - Kubernetes
cover: 'https://static.zahui.fan/images/202211212221065.svg'
tags:
  - Container
  - Kubernetes
  - Ubuntu
  - 配置记录
  - keepalived
date: 2021-04-19 17:02:22
---


> 官方文档: <https://ubuntu.com/kubernetes/docs>

## 开始之前

集群ip规划，所有机器系统都是`ubuntu 20.04`

| hostname          | ip        |
| ----------------- | --------- |
| juju-client       | 10.0.0.10 |
| juju-controller-1 | 10.0.0.11 |
| juju-master-1     | 10.0.0.21 |
| juju-master-2     | 10.0.0.22 |
| juju-master-3     | 10.0.0.23 |
| juju-worker-1     | 10.0.0.31 |
| juju-worker-2     | 10.0.0.32 |

> juju-client 为juju客户端和haproxy机器
> juju-controller-1为juju控制器节点(可以做高可用)

以下操作都是在juju-client上执行

### 安装juju

```bash
sudo snap install juju --classic
```

### 设置云类型

```bash
juju add-cloud
输入manual
```

### 添加机器(一共5台)

```bash
juju bootstrap
juju add-machine ssh:root@x.x.x.x
```

> 机器添加完成后, `juju machines` 能看到机器id

### 生成yaml

~~在<https://jujucharms.com/new/>画图，然后导出成yaml~~
`etcd` 还是 和 `master` 分开部署  
etcd.yaml

```yml
description: Kubernetes Cluster Deploy.
series: focal
machines:
  '0':
    series: focal
  '1':
    series: focal
  '2':
    series: focal
  '3':
    series: focal
  '4':
    series: focal
applications:
  easyrsa:
    charm: cs:~containers/easyrsa-345
    num_units: 1
    resources:
      easyrsa: 5
    to:
    - '0'
  etcd:
    charm: cs:~containers/etcd-553
    num_units: 5
    options:
      channel: 3.4/stable
      bind_to_all_interfaces: false
    resources:
      core: 0
      etcd: 3
      snapshot: 0
    to:
    - '0'
    - '1'
    - '2'
    - '3'
    - '4'
relations:
- - etcd:certificates
  - easyrsa:client
```

core.yaml

```yaml
description: Kubernetes Cluster Deploy.
series: focal
machines:
  '0':
    series: focal
  '1':
    series: focal
  '2':
    series: focal
  '3':
    series: focal
  '4':
    series: focal
  '5':
    series: focal
  '6':
    series: focal
  '7':
    series: focal
  '8':
    series: focal
applications:
  containerd:
    charm: cs:~containers/containerd-102
    resources: {}
  easyrsa:
    charm: cs:~containers/easyrsa-345
    num_units: 1
    resources:
      easyrsa: 5
    to:
    - '0'
  etcd:
    charm: cs:~containers/etcd-553
    num_units: 5
    options:
      channel: 3.4/stable
      bind_to_all_interfaces: false
    resources:
      core: 0
      etcd: 3
      snapshot: 0
    to:
    - '0'
    - '1'
    - '2'
    - '3'
    - '4'
  kubeapi-load-balancer:
    charm: cs:~containers/kubeapi-load-balancer-757
    expose: true
    num_units: 1
    resources: {}
    to:
    - '5'
  kubernetes-master:
    charm: cs:~containers/kubernetes-master-955
    expose: true
    num_units: 3
    options:
      channel: 1.20/stable
      service-cidr: 172.31.64.0/21
      enable-dashboard-addons: false
      proxy-extra-args: proxy-mode=ipvs
    resources:
      cdk-addons: 0
      core: 0
      kube-apiserver: 0
      kube-controller-manager: 0
      kube-proxy: 0
      kube-scheduler: 0
      kubectl: 0
    to:
    - '5'
    - '6'
    - '7'
  kubernetes-worker:
    charm: cs:~containers/kubernetes-worker-726
    expose: true
    num_units: 1
    options:
      channel: 1.20/stable
      proxy-extra-args: proxy-mode=ipvs
    resources:
      cni-amd64: 708
      cni-arm64: 699
      cni-s390x: 711
      core: 0
      kube-proxy: 0
      kubectl: 0
      kubelet: 0
    to:
    - '8'
  canal:
    charm: 'cs:~containers/canal-755'
    options:
      cidr: 172.31.0.0/18
      iface: eth0
      ignore-loose-rpf: true
    series: focal
relations:
- - kubernetes-master:kube-api-endpoint
  - kubeapi-load-balancer:apiserver
- - kubernetes-master:loadbalancer
  - kubeapi-load-balancer:loadbalancer
- - kubernetes-worker:kube-api-endpoint
  - kubeapi-load-balancer:website
- - kubernetes-master:kube-control
  - kubernetes-worker:kube-control
- - kubernetes-master:certificates
  - easyrsa:client
- - kubeapi-load-balancer:certificates
  - easyrsa:client
- - kubernetes-master:etcd
  - etcd:db
- - kubernetes-worker:certificates
  - easyrsa:client
- - etcd:certificates
  - easyrsa:client
- - canal:etcd
  - etcd:db
- - canal:cni
  - kubernetes-master:cni
- - canal:cni
  - kubernetes-worker:cni
- - containerd:containerd
  - kubernetes-worker:container-runtime
- - containerd:containerd
  - kubernetes-master:container-runtime
```

### 根据yml来部署

```bash
juju deploy ./etcd.yaml --map-machines=existing,0=0,1=1,2=2,3=3,4=4
juju deploy ./core.yaml --map-machines=existing,0=0,1=1,2=2,3=3,4=4,5=5,6=6,7=7,8=8
```

juju status 全部idle就算正常了

### 扩容worker节点

```bash
juju add-machine ssh:root@x.x.x.x
juju add-unit kubernetes-worker --to <machine_id>
```

## kata容器

### 部署

```bash
juju deploy cs:~containers/kata
juju add-relation kata kubernetes-master
juju add-relation kata kubernetes-worker
juju add-relation kata:untrusted containerd:untrusted
```

### 使用

部署的时候加上`io.kubernetes.cri.untrusted-workload: "true"`

```yml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-untrusted
  annotations:
    io.kubernetes.cri.untrusted-workload: "true"
spec:
  containers:
    image: nginx
```

### 删除kata运行时

```bash
juju remove-relation --force kata kubernetes-master
juju remove-relation --force kata kubernetes-worker
juju remove-relation --force kata:untrusted containerd:untrusted
juju remove-application kata
```

## 更换master节点

### 先删除节点

```bash
juju remove-unit etcd/1 --force --no-wait
juju remove-unit kubernetes-master/1 --force --no-wait
juju remove-machine 1 --force --no-wait
```

### etcd集群删除这个member

> <https://ubuntu.com/kubernetes/docs/charm-etcd>

需要先下载证书到本地(要解压)

```bash
juju run-action --wait etcd/0 package-client-credentials
juju scp etcd/0:etcd_credentials.tar.gz etcd_credentials.tar.gz
```

然后使用etcdctl删除节点

```bash
export ETCDCTL_KEY_FILE=$(pwd)/client.key
export ETCDCTL_CERT_FILE=$(pwd)/client.crt
export ETCDCTL_CA_FILE=$(pwd)/ca.crt
export ETCDCTL_ENDPOINT=https://10.0.0.21:2379
etcdctl member list

etcdctl member remove c2499df1988d1925
```

### 增加节点

```bash
juju add-machine ssh:root@100.64.1.167
juju machines
记住节点ID,假如是9
```

### 扩容master到节点9

```bash
juju add-unit kubernetes-master --to 9
```

### 扩容etcd到节点9

```bash
juju add-unit etcd --to 9
```

## master节点高可用

### 方案1 搭建haproxy负载均衡

> 添加了参数`proxy-extra-args: proxy-mode=ipvs`表示使用lvs做负载均衡，可以不用haproxy

1. haproxy配置文件

    ```conf
    ...省略

    frontend http_ingress_traffic_fe
        bind 0.0.0.0:80
        mode tcp
        default_backend   http_ingress_traffic_be

    backend http_ingress_traffic_be
        mode tcp
        balance     roundrobin
        server      juju-worker-1 10.0.0.31:80 check
        server      juju-worker-2 10.0.0.32:80 check

    frontend https_ingress_traffic_fe
        bind 0.0.0.0:443
        mode tcp
        default_backend   https_ingress_traffic_be

    backend https_ingress_traffic_be
        mode tcp
        balance     roundrobin
        server      juju-worker-1 10.0.0.31:443 check
        server      juju-worker-2 10.0.0.32:443 check

    frontend k8s_api_fe
        bind 0.0.0.0:6443
        mode tcp
        default_backend   k8s_api_be

    backend k8s_api_be
        mode tcp
        balance     roundrobin
        server      juju-master-1 10.0.0.21:6443 check
        server      juju-master-2 10.0.0.22:6443 check
        server      juju-master-3 10.0.0.23:6443 check
    ```

2. 修改负载均衡的ip

    ```bash
    juju config kubernetes-master loadbalancer-ips="10.0.0.10"
    ```

### 方案2 使用keepalived

参考文章：<https://ubuntu.com/kubernetes/docs/keepalived>

## juju-controller高可用

### 增加新的controller节点

首先切换到controller

```bash
juju switch controller
# juju switch default 切换回来
```

```bash
juju add-machine ssh:root@100.64.1.169
```

查看controller机器

```bash
juju machines
```

### 开启高可用

```bash
juju enable-ha --to 5,6
```

查看controller信息

```bash
juju controllers --refresh
juju controllers
```

## 其他常见问题

### 安装kubectl

1. 安装

    ```bash
    sudo snap install kubectl --classic
    ```

2. 获取新的kubeconfig配置文件

    ```bash
    juju scp kubernetes-master/0:config ~/.kube/config
    ```

### 操作etcd

```bash
juju run-action --wait etcd/10 package-client-credentials
juju scp etcd/25:etcd_credentials.tar.gz etcd_credentials.tar.gz

etcdctl --cacert=$(pwd)/ca.crt --cert=$(pwd)/client.crt --key=$(pwd)/client.key --endpoints="https://172.31.72.5:2379" member list
```

### 重新添加节点

> 比如已经添加过的机器，由于配置出错或者其他原因想重新添加进来初始化，可以先移除再添加。

```bash
juju remove-machine <machine-id> --force
```

在目标机器上执行

```bash
sudo /sbin/remove-juju-services
sudo rm -rf /root/cdk /var/lib/juju/ /opt/calicoctl
```
