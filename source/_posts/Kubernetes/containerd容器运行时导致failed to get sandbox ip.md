---
title: containerd容器运行时导致failed to get sandbox ip
categories:
  - Kubernetes
tags:
  - Kubernetes
date: 2024-01-05 16:02:08
---


## 问题

```
使用containerd作为容器运行时导致的kubelet  error determining status: rpc error: code = Unknown desc = failed to get sandbox ip: check network namespace closed: remove netns: unlinkat
```

### 处理方法

```yaml
echo 1 > /proc/sys/fs/may_detach_mounts
或者
sysctl -w fs.may_detach_mounts=1

建议：
部署过程中追加 内核参数： fs.may_detach_mounts=1
```