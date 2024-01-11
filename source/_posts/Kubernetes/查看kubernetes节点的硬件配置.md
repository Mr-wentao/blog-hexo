---
title: 查看kubernetes节点的硬件配置
categories:
  - Kubernetes
tags:
  - k8s
  - 常用操作
abbrlink: lo57b8gx
cover: 'https://static.zahui.fan/images/202211212221065.svg'
date: 2023-10-25 11:33:54
---

`kubectl describe node` 可以查看到信息, 这里使用jq进行一下数据处理格式化.


```bash
kubectl get node -o json | jq '.items[] | "===========================================", "机器名: \(.metadata.labels."kubernetes.io/hostname") ", "CPU: \(.status.capacity.cpu) 核",  "内存大小:  \(.status.capacity.memory)"'
```

输出结果类似于:

![image.png](https://static.zahui.fan/images/202310251137563.png)
