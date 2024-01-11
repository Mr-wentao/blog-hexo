---
title: kubernetes节点维护流程
categories:
  - Kubernetes
tags:
  - Kubernetes
  - kubernetes
  - k8s
  - 滚动
abbrlink: 52feaa76
date: 2023-06-26 23:06:49
---

> 节点设置为`SchedulingDisabled` 其实就是打上污点 `node.kubernetes.io/unschedulable:NoSchedule`

| 命令                    | 说明                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| kubectl cordon <node>   | 将node设置为SchedulingDisabled, 不允许新的pod调度上来, 旧的pod不受影响          |
| kubectl drain <node>    | 先驱逐node上的pod, k8s会在其他节点重新创建, 然后将节点设置为 SchedulingDisabled |
| kubectl uncordon <node> | 恢复调度, 删除 SchedulingDisabled 污点                                          |


## 操作流程

### 常规操作

将节点上现有的pod驱逐, 不追求优雅

```bash
kubectl drain <node> --delete-local-data=true --ignore-daemonsets=true --force
```

操作完毕后, 将节点恢复调度

```bash
kubectl uncordon <node>
```

### 对集群无影响的操作

先针对节点执行

```bash
kubectl cordon <node>
```

然后等待节点上的pod自然转移(比如版本发布等)

然后将节点下线

```bash
kubectl delete node <node>
```
