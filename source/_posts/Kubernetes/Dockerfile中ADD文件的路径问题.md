---
title: Dockerfile中ADD文件的路径问题
categories:
  - Kubernetes
tags:
  - Docker
  - Container
  - CICD
abbrlink: lmucp5lg
date: 2023-09-22 16:39:31
---

首先看一个案例

当前目录的文件如下:

```bash
[root@devops_build watcher_svr]# tree
.
├── 1
├── 2
│   └── 3
└── Dockerfile

1 directory, 3 files
```

`Dockerfile`文件内容如下:

```dockerfile
FROM harbor.ingeek.com/base/node:14.20.1-buster
ADD * /code/
WORKDIR /code
```

本意是想把当前目录下的所有文件放到容器内的`/code`目录, 这个时候使用 `docker build` 后无法启动, 进入容器, 打开`/code`一看:

```bash
[root@devops_build watcher_svr]# docker run -it test bash
root@cb7543054ef2:/code# ls -al
total 12
drwxr-xr-x 2 root root 4096 Sep 22 08:47 .
drwxr-xr-x 1 root root 4096 Sep 22 08:47 ..
-rw-r--r-- 1 root root    0 Sep 22 08:45 1
-rw-r--r-- 1 root root    0 Sep 22 08:45 3
-rw-r--r-- 1 root root   75 Sep 22 08:46 Dockerfile
root@cb7543054ef2:/code#
```

会发现, 本来3这个文件应该是在2这个文件夹内的, 现在统一都跑到了上级目录了, 文件路径完全变了. 自然无法启动. 可以做如下修改:

```dockerfile
FROM harbor.ingeek.com/base/node:14.20.1-buster
ADD ./ /code/
WORKDIR /code
```
