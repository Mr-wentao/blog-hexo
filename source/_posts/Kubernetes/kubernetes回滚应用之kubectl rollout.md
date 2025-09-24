---
title: Kubernetes回滚应用之kubectl rollout
abbrlink: 8d88b8c4
cover: 'https://s3.babudiu.com/iuxt//images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - kubectl
  - Kubernetes
  - k8s
date: 2022-05-20 23:52:58
---

kubernetes 每次更新资源会记录资源的历史版本， 方便我们进行回滚操作。真的k8s解决了很多运维的痛点问题, 想起来以前没有用k8s的时候,用jenkins和ansible来做的发布和回滚...

## 查看历史版本

```bash
kubectl rollout history deployment nfs-client-provisioner

deployment.apps/nfs-client-provisioner
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
4         <none>
5         <none>
```

> 这里列出的就是版本， 为什么没有3， 因为从版本4回滚到了版本3， 则版本3就变成了版本5

## 查看指定版本详情

```bash
kubectl rollout history deployment nfs-client-provisioner --revision=4
```

也可以以yaml格式输出

```bash
kubectl rollout history deployment nfs-client-provisioner --revision=4 -o yaml
```

## 回滚到指定版本

```bash
kubectl rollout undo deployment nfs-client-provisioner --to-revision=4
```

> 回滚到上一个版本可以不用增加`--to-revision=4`参数, 默认就是回滚上一个版本

## 记录版本变化

### 执行命令记录变化

在第一步查看历史版本, CHANGE-CAUSE 显示的是none, 如果需要记录kubectl执行的命令,则执行命令的时候需要添加参数

```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1 --record=true
```

这样就会把当前的命令记录到版本的CHANGE-CAUSE这一栏

### 设置历史版本数量

在yml文件里面可以设置历史版本的数量, 比如:

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
```