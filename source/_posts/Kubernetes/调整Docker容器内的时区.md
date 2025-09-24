---
title: 调整Docker容器内的时区
categories:
  - Kubernetes
tags:
  - docker
  - timezone
  - 时区
abbrlink: 3c828831
cover: 'https://s3.babudiu.com/iuxt//images/202211011524478.png'
date: 2022-12-21 12:29:55
---

容器内的时区问题会影响到服务打印的日志, 所以设置时区是很有必要的, 设置容器内时区的方法一般有:

1. 设置TZ环境变量
2. 挂载主机的时区文件
3. 直接修改镜像的dockerfile,将时区默认配置在镜像里

## 设置TZ环境变量

docker环境下, 增加 -e 参数:

```bash
docker run --name test --rm -ti -e TZ=Asia/Shanghai debian date
```

这种方法也可以写在Dockerfile里面, 增加一行:

```dockerfile
ENV TZ Asia/Shanghai
```

> 经测试: Debian CentOS 镜像可以支持这种方案
> Ubuntu Alpine 不支持这种方案

## 挂载主机的timezone和localtime

Docker环境下, 增加 -v 参数:

```bash
docker run --name test --rm -ti -v /etc/timezone:/etc/timezone:ro -v /etc/localtime:/etc/localtime:ro alpine date
```

适用于大部分镜像, 特点是和主机保持一致, 缺点是依赖主机的环境

## 通过build镜像修改

### Alpine

将以下代码添加到 Dockerfile 中：

```dockerfile
ENV TZ Asia/Shanghai

RUN apk add tzdata && cp /usr/share/zoneinfo/${TZ} /etc/localtime
    && echo ${TZ} > /etc/timezone
    && apk del tzdata
```

### Debian

Debian 基础镜像 中已经安装了 tzdata 包，我们可以将以下代码添加到 Dockerfile 中：

```dockerfile
ENV TZ=Asia/Shanghai
    DEBIAN_FRONTEND=noninteractive

RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime
    && echo ${TZ} > /etc/timezone
    && dpkg-reconfigure --frontend noninteractive tzdata
    && rm -rf /var/lib/apt/lists/*
```

### Ubuntu

Ubuntu 基础镜像中没有安装了 tzdata 包，因此我们需要先安装 tzdata 包。
我们可以将以下代码添加到 Dockerfile 中。

```dockerfile
ENV TZ=Asia/Shanghai
    DEBIAN_FRONTEND=noninteractive

RUN apt update
    && apt install -y tzdata
    && ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime
    && echo ${TZ} > /etc/timezone
    && dpkg-reconfigure --frontend noninteractive tzdata
    && rm -rf /var/lib/apt/lists/*
```

### CentOS

CentOS 基础镜像 中已经安装了 tzdata 包，我们可以将以下代码添加到 Dockerfile 中。

```dockerfile
ENV TZ Asia/Shanghai

RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime
    && echo ${TZ} > /etc/timezone
```
