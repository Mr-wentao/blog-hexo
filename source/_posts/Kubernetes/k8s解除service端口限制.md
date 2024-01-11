---
title: k8s解除service端口限制
categories:
  - Kubernetes
tags:
  - k8s
  - Kubernetes
abbrlink: lmri345s
date: 2023-09-20 16:47:02
---


我自己写了一个svc的yaml文件，部署的时候报错，不在默认的范围内，默认范围是: `30000-32767`

`kubectl apply -f nginx-src.yaml`

报错:
```bash
The Service "nginx" is invalid: spec.ports[0].nodePort: Invalid value: 80: provided port is not in the valid range. The range of valid ports is 30000-32767
```


如果是kubeadm部署
修改配置文件 `vim /etc/kubernetes/manifests/kube-apiserver.yaml`

在启动参数里面添加如下一行

```yml
- --service-node-port-range=1-65535
```


重启 kube-apiserver

```bash
kubectl delete pod -n kube-system kube-apiserver-xxx
```
