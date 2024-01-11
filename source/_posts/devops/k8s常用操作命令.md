---
title: k8s常用操作命令
tags: k8s常用操作命令
categories:
  - devops
abbrlink: e53e29f0
---

**创建k8s-api管理员token**

```bash
# 创建token
kubectl create serviceaccount k8s-admin -n kube-system
kubectl create clusterrolebinding k8s-admin --clusterrole=cluster-admin --serviceaccount=kube-system:k8s-admin
# 查看token
kubectl -n kube-system describe secrets $(kubectl -n kube-system get secret | grep k8s-admin | awk '{print $1}')

```
**后端业务是 HTTPS 服务，通过 Ingress-Nginx 转发**

```yaml
annotations:
  nginx.ingress.kubernetes.io/backend-protocol: HTTPS
```
**kubectl自动补全安装**
```
yum -y install bash-completion

source /usr/share/bash-completion/bash_completion

source <(kubectl completion bash)

echo "source <(kubectl completion bash)" >> ~/.bashrc


```
