---
title: Kafka + Zookeeper集群搭建
abbrlink: 60a9e345
categories:
  - 日志
tags:
  - Kafka
  - MQ
  - 配置记录
date: 2022-03-20 21:49:24
---

新版本的kafka可以不依赖zookeeper，不过目前处于测试阶段，且不支持zookeeper迁移到新本，所以在生产环境还是建议等一等。本文使用的是[kafka_2.13-2.8.1.tgz](https://archive.apache.org/dist/kafka/2.8.1/kafka_2.13-2.8.1.tgz)

zookeeper相关的文档可以参考<https://zookeeper.apache.org/doc/r3.8.0/zookeeperStarted.html>

## 安装规划

| 说明              | 目录                       |
| ----------------- | -------------------------- |
| kafka程序目录     | /data/src/kafka_2.13-2.8.1 |
| kafka数据目录     | /data/kafka-logs           |
| zookeeper数据目录 | /data/zookeeper_data       |

## 准备

### 首先需要安装java环境

{% tabs TabName %}
<!-- tab Ubuntu和Debian -->

```bash
sudo apt install -y openjdk-8-jdk-headless
```

<!-- endtab -->
<!-- tab CentOS和Fedora -->

```bash
sudo yum install -y java-1.8.0-openjdk
```

<!-- endtab -->
{% endtabs %}

### 创建目录

```bash
mkdir /data/kafka-logs -p
mkdir /data/zookeeper_data -p
ln -s /data/src/kafka_2.13-2.8.1 /data/src/kafka
```

## 配置zookeeper

### 修改zookeeper配置

vim config/zookeeper.properties

```conf
dataDir=/data/zookeeper_data
# the port at which the clients will connect
clientPort=2181
# disable the per-ip limit on the number of connections since this is a non-production config
maxClientCnxns=0
# Disable the adminserver by default to avoid port conflicts.
# Set the port to something non-conflicting if choosing to enable this
admin.enableServer=false
# admin.serverPort=8080

tickTime=2000
initLimit=5
syncLimit=2
server.1=10.0.0.31:2888:3888
server.2=10.0.0.32:2888:3888
server.3=10.0.0.33:2888:3888
```

### 创建数据目录和集群ID

> myid 集群内不能重复的，每台机器设置成不一样的。

```bash
echo 1 > /data/zookeeper_data/myid
```

### 启动zookeeper

创建systemd文件(可选)

vim /etc/systemd/system/zookeeper.service

```ini
[Unit]
Description=Zookeeper service
After=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/data/src/kafka/bin/zookeeper-server-start.sh /data/src/kafka/config/zookeeper.properties
ExecStop=/data/src/kafka/bin/zookeeper-server-stop.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 配置kafka

### 修改配置文件

vim config/server.properties

```conf
broker.id=1                            # 每个节点需要不一样
listeners=PLAINTEXT://10.0.0.31:9092   # IP和你的节点IP保持一致
zookeeper.connect=10.0.0.31:2181,10.0.0.32:2181,10.0.0.33:2181
```

### 启动kafka

```bash
bin/kafka-server-start.sh config/server.properties
```

> 如果报错：
> kafka.common.InconsistentClusterIdException: The Cluster ID C4wRULTzSGqNoEAInvubIw doesn't match stored clusterId Some(eA5rD8rZSUm3EXr2glib2w) in meta.properties. The broker is trying tojoin the wrong cluster. Configured zookeeper.connect may be wrong.
>
> 这个时候需要删除kafka的log目录，让程序重新生成

创建systemd配置文件

vim /etc/systemd/system/kafka.service

```ini
[Unit]
Description=Apache Kafka server (broker)
After=network.target zookeeper.service

[Service]
Type=simple
User=root
Group=root
ExecStart=/data/src/kafka/bin/kafka-server-start.sh /data/src/kafka/config/server.properties
ExecStop=/data/src/kafka/bin/kafka-server-stop.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 测试和使用

```bash
cd /data/src/kafka

# 创建topic
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic testtopic

# 查看topic list
bin/kafka-topics.sh --zookeeper localhost:2181 --list

# 控制台生产消息
bin/kafka-console-producer.sh --bootstrap-server kafka2:9092 --topic testtopic

# 控制台消费消息
bin/kafka-console-consumer.sh --bootstrap-server kafka3:9092 --topic testtopic --from-beginning
```
