---
title: Redis集群模式部署
categories:
  - devops
tags:
  - redis
abbrlink: 5cc4b89d
cover: 'https://static.zahui.fan/images/202212202103572.svg'
date: 2022-12-16 10:43:06
---

搭建个6节点的集群，包括三主三从

## 创建配置文件

```conf
port 6379
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
daemonize yes
protected-mode no
pidfile  /var/run/redis.pid
```

> 如果是同一台机器上跑6个实例的话，需要保证端口和pid文件不能重复

## 启动服务器

在每台机器上面执行，启动6个redis服务器

```bash
redis-server redis.conf
```

## 创建集群

在一台机器上执行：

```bash
redis-cli --cluster create --cluster-replicas 1 192.168.1.11:6379 192.168.1.12:6379 192.168.1.13:6379 192.168.1.14:6379 192.168.1.15:6379 192.168.1.16:6379
```

出现提示，输入yes

![创建集群](https://static.zahui.fan/images/202212161407297.png)

## 连接集群

```bash
redis-cli -c -h 192.168.1.11 -p 6379
```

```bash
[root@ops_manage redis-cluster]# ./redis-cli -c -h 127.0.0.1 -p 7001
127.0.0.1:7001> get foo
-> Redirected to slot [12182] located at 127.0.0.1:7003
"bar"
127.0.0.1:7003>
```
