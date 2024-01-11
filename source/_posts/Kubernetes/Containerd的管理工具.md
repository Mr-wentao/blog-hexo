---
title: Containerd的管理工具
abbrlink: be10bdea
categories:
  - Kubernetes
tags:
  - containerd
  - cli
date: 2022-07-23 22:24:18
---

## 命令对比

| 命令           | docker         | crictl（推荐）  | ctr                    |
| :------------- | :------------- | :-------------- | :--------------------- |
| 查看容器列表   | docker ps      | crictl ps       | ctr -n k8s.io c ls     |
| 查看容器详情   | docker inspect | crictl inspect  | ctr -n k8s.io c info   |
| 查看容器日志   | docker logs    | crictl logs     | 无                     |
| 容器内执行命令 | docker exec    | crictl exec     | 无                     |
| 挂载容器       | docker attach  | crictl attach   | 无                     |
| 容器资源使用   | docker stats   | crictl stats    | 无                     |
| 创建容器       | docker create  | crictl create   | ctr -n k8s.io c create |
| 启动容器       | docker start   | crictl start    | ctr -n k8s.io run      |
| 停止容器       | docker stop    | crictl stop     | 无                     |
| 删除容器       | docker rm      | crictl rm       | ctr -n k8s.io c del    |
| 查看镜像列表   | docker images  | crictl images   | ctr -n k8s.io i ls     |
| 查看镜像详情   | docker inspect | crictl inspecti | 无                     |
| 拉取镜像       | docker pull    | crictl pull     | ctr -n k8s.io i pull   |
| 推送镜像       | docker push    | 无              | ctr -n k8s.io i push   |
| 删除镜像       | docker rmi     | crictl rmi      | ctr -n k8s.io i rm     |
| 查看Pod列表    | 无             | crictl pods     | 无                     |
| 查看Pod详情    | 无             | crictl inspectp | 无                     |
| 启动Pod        | 无             | crictl runp     | 无                     |
| 停止Pod        | 无             | crictl stopp    | 无                     |

## 导入导出镜像

containerd有namespace的概念，所以需要指定

```bash
# 导出镜像
ctr -n k8s.io image export k8s.gcr.io/coredns/coredns:v1.8.0  coredns_v1.8.0.tar

# 导入镜像
ctr -n=k8s.io image import coredns_v1.8.0.tar
```

## 登录仓库

您可以使用ctr login命令登录仓库。例如，如果您要登录registry.cn-hangzhou.aliyuncs.com，则可以使用以下命令：

```bash
ctr login --username=<username> registry.cn-hangzhou.aliyuncs.com
```

请注意，<username>是您的用户名.

## 打tag

```bash
ctr image tag <image-name> <old-tag> <new-tag>
```

请注意，<image-name>是镜像名称，<old-tag>是旧标记，<new-tag>是新标记


## 推送镜像

```bash
ctr image push <image-name>:<new-tag>
```
