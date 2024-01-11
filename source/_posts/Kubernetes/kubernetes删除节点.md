---
title: kubernetes删除节点
categories:
  - Kubernetes
tags:
  - k8s
abbrlink: b1a2141c
cover: 'https://static.zahui.fan/images/202211212221065.svg'
date: 2022-11-07 11:52:11
---

## 删除worker节点

设置节点不可调度，即不会有新的pod在该节点上创建

```bash
kubectl cordon 172.16.21.26
kubectl drain 172.16.21.26 --delete-local-data --ignore-daemonsets --force
```

> –delete-local-data: 即使pod使用了emptyDir也删除
> –ignore-daemonsets: 忽略deamonset控制器的pod，如果不忽略，deamonset控制器控制的pod被删除后可能马上又在此节点上启动起来,会成为死循环；
> –force: 不加force参数只会删除该NODE上由ReplicationController, ReplicaSet, DaemonSet,StatefulSet or Job创建的Pod，加了后还会删除’裸奔的pod’(没有绑定到任何replication controller)

kubectl delete node 172.16.21.26

## 删除master节点

未完待续
