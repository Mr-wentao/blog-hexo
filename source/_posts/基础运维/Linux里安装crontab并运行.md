---
title: Linux里安装crontab并运行
categories:
  - 基础运维
tags:
  - Crontab
  - Linux
  - 配置记录
abbrlink: lnmt2t0q
date: 2023-10-12 14:35:35
---

常见的linux发行版都自带了crontab服务, 但是我们常用的容器镜像是没有的, 不要问我为什么要在容器里运行crontab...
[Linux定时执行任务crontab](/posts/2de1df7e/)
[Linux的crontab无法执行的一些问题](/posts/63d10d9c/)

## CentOS/RedHat系列

### 安装

```bash
yum install -y cronie
```

### 配置文件位置

后面的root是用户名
```bash
/var/spool/cron/root
```
### 启动命令

```bash
# 后台运行
crond

# 前台运行
crond -f 
```

## Ubuntu/Debian系列

### 安装

```bash
sudo apt-get install -y cron
```

### 配置文件位置

后面的root是用户名
```bash
/var/spool/cron/crontabs/root
```

### 启动命令

```bash
# 后台运行
cron

# 前台运行
cron -f
```

## Alpine

### 安装

官方镜像自带了

### 配置文件位置

后面的root是用户名
```bash
/etc/crontabs/root
```

### 启动命令

```bash
# 前台运行
crond -f

# 后台运行
crond
```