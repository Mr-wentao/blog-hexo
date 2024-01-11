---
title: 找出占用Kubernetes节点磁盘的Pod
categories:
  - Kubernetes
tags:
  - Kubernetes
  - k8s
abbrlink: lo47lj11
cover: 'https://static.zahui.fan/images/202211212221065.svg'
date: 2023-10-24 18:54:08
---

有部分开发不规范导致日志写入容器, 在k8s环境下导致节点磁盘空间占用过高, 解决方案有: 
1. 通过监控告警来提前预防
2. 挂载磁盘, 容器日志写入磁盘
3. 使用自动清理脚本

## kubectl查询每个pod占用磁盘空间

```bash
kubectl get --raw /api/v1/nodes/10.20.20.12/proxy/stats/summary | jq '.pods[] | "PodName:  \(.podRef.name)", "usedBytes:   \(.containers[].rootfs.usedBytes)", "======================================================"'
```

输出结果如图:
![image.png](https://static.zahui.fan/images/202310241858426.png)

## Docker相关操作

### 查看容器磁盘占用

```bash
# 节点上查看磁盘使用情况,并安装从大到小排序,可以看到各个容器的占用磁盘空间。
docker ps -a --format "table {{.Size}}\t{{.Names}}" | sort -hr

# 查看磁盘总体使用情况
docker system df
```

