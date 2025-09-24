---
title: 使用kubeasz搭建一套高可用的Kubernetes集群
abbrlink: 6f59afe4
cover: 'https://s3.babudiu.com/iuxt//images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - Linux
  - Container
  - Kubernetes
  - 配置记录
date: 2022-05-08 09:25:36
---

kubeasz 是基于ansible和shell制作的工具，可以快速搭建一个高可用的k8s集群（二进制部署），不需要额外的负载均衡。项目地址：<https://github.com/easzlab/kubeasz>, kubeasz 每个版本对应了支持的k8s版本, 可以到项目主页查看, 这里使用 kubeasz版本3.0.0, 部署k8s 1.18.2

> 另见kubeadm部署  
> [在centos使用kubeadm部署k8s](/posts/b86d9e9f/)  
> [在ubuntu使用kubeadm部署k8s](/posts/526ffc9a/)

## 安装准备

准备机器如下：

| 机器          | IP        |
| ------------- | --------- |
| kubeasz操作机 | 10.0.0.7  |
| master1       | 10.0.0.31 |
| master2       | 10.0.0.32 |
| master3       | 10.0.0.33 |
| worker1       | 10.0.0.41 |

首先确保操作机可以通过ssh连接到其他所有机器，最好密钥打通（这是使用ansible的必要条件）

## 安装kubeasz

### 安装ansible

```bash
yum install epel-release -y
yum install ansible -y
```

### 下载ezdown部署工具

```bash
export release=3.0.0                     # 设置kubeasz版本
wget https://github.com/easzlab/kubeasz/releases/download/${release}/ezdown
chmod +x ./ezdown
```

### 下载kubeasz离线包等

```bash
# 下载默认版本
./ezdown -D

# 可以使用-k参数指定需要下载的k8s版本
./ezdown -D -k v1.18.2
```

下载的文件位于`/etc/kubeasz`目录

### 下载离线deb/rpm包

(可选) 适用于纯内网环境，无法连接网络

```bash
./ezdown -P
```

## 部署集群

```bash
cd /etc/kubeasz/
./ezctl new k8s-cluster
```

根据需求修改配置文件

ansible主机清单（定义主机IP）`/etc/kubeasz/clusters/k8s-cluster/hosts`
集群配置文件 `/etc/kubeasz/clusters/k8s-cluster/config.yml`

开始部署

```bash
./ezctl setup k8s-cluster all
```

## 检查部署结果

查看 kubernetes 集群的组件状态（基本都是通过 systemd 管理的）

### 在 master 节点上查看

```bash
systemctl status etcd
systemctl status kube-apiserver
systemctl status kube-scheduler
systemctl status kube-controller-manager
```

### 在 master 和 node 节点上查看

```bash
systemctl status kubelet 
systemctl status kube-proxy 
systemctl status docker
```


## 清理集群

如果需要执行清理操作:
```bash
./ezctl destroy k8s-cluster
```
