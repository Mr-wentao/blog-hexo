---
title: 获取Kubernetes的token
categories:
  - Kubernetes
tags:
  - Kubernetes
  - 记录
  - 配置记录
abbrlink: lr0clio1
date: 2024-01-05 16:02:08
---


## 获取admin的token

如果有这个secret, 可以直接查看token
```bash
kubectl -n kube-system get secret admin-token-nwphb -o jsonpath={.data.token} | base64 -d
```

## 新版k8s命令为

选择一个现有的serviceaccount

```bash
kubectl get serviceaccount
```

使用这个serviceaccount创建一个token(并设置有效期)

```bash
kubectl create token default --duration 10m
```


## 新建一个用户获取token

如果考虑到权限没有合适的,或者没有相关的secret,可以通过创建一个新的用户来获取token, 未完待续