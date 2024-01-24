---
title: 编译安装Redis记录
categories:
  - devops
tags:
  - 记录
  - 编译
abbrlink: 1da8e73d
date: 2023-07-21 16:37:32
---

## 下载解压

```bash
wget https://download.redis.io/releases/redis-6.0.9.tar.gz
tar xf redis-6.0.9.tar.gz
cd redis-6.2.13
```

## 编译

编译需要gcc

```bash
make
```

## 安装

```bash
sudo mkdir -p /usr/local/redis/{bin,conf}
sudo cp src/{redis-benchmark,redis-check-aof,redis-check-rdb,redis-cli,redis-server} /usr/local/redis/bin/
sudo cp redis.conf /usr/local/redis/conf/redis.conf
```

## 启动

```bash
/usr/local/redis/bin/redis-server /usr/local/redis/conf/redis.conf
```

## 通过systemd管理

vim /usr/lib/systemd/system/redis.service

```ini
[unit]
Description=redis-server
After=network.target
 
[Service]
Type=forking
ExecStart=/usr/local/redis/bin/redis-server /usr/local/redis/conf/redis.conf
PrivateTmp=true
 
[Install]
WantedBy=multi-user.target
```