---
title: Docker容器间优雅的互联
abbrlink: d083ba2e
categories:
  - Kubernetes
cover: 'https://s3.babudiu.com/iuxt//images/202211011524478.png'
tags:
  - Docker
  - Container
date: 2022-04-25 22:13:22
---

本文主要介绍如何优雅的让Docker容器和Docker容器之间相互通信，以及Docker容器如何和宿主机进行网络通信。

## 容器间网络通信

docker容器间通信常见的方式是使用 --link 进行连接，但是Docker已经弃用这种方式，并且容器数量一旦一多，--link 会显得很乱。官方推荐使用自定义网络来进行互联。

### 创建自定义网络

```bash
docker network create my-network
```

### 创建容器使用自定义network

比如一个nginx容器需要访问php容器

```bash
docker run -p 80:80 --network my-network nginx
docker run --name php --network my-network php
```

这个时候nginx可以直接通过`php`来访问php容器，打开/etc/hosts可以发现是docker自动帮你添加了解析

## 容器访问主机服务

可以使用容器的网关IP来访问（nat网络），不过使用ip不优雅，旧版本的Docker可以使用`host.docker.internal`来访问主机，新版本的无法直接访问，可以通过 `docker run` 增加启动参数来兼容这种方案

```bash
docker run --name nginx \
  -v "$(pwd)"/www:/usr/share/nginx/html:ro \
  -v "$(pwd)"/conf/nginx.conf:/etc/nginx/nginx.conf \
  -v "$(pwd)"/conf/conf.d:/etc/nginx/conf.d \
  -v "$(pwd)"/conf/ssl:/etc/nginx/ssl \
  -p 80:80 \
  -p 443:443 \
  --add-host=host.docker.internal:host-gateway \
  --network iuxt \
  --restart always \
  -d nginx
```

之后就可以在容器内通过`host.docker.internal`来访问主机了。

## 使用固定的ip进行通信

如果想固定每个容器的IP，比如想部署一个ElasticSearch集群，需要每个节点IP都配置到配置文件里面。可以使用这种方式：

```bash
# 创建一个Docker网络
docker network create --subnet=172.16.0.0/24 elasticsearch-br0

# 每个容器手动指定使用这个Docker网络，并分配固定的IP
docker run -d --name elasticsearch1 \
    -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    -v "$(pwd)"/elasticsearch1.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro \
    -v es-data1:/usr/share/elasticsearch/data:rw \
    -v es-logs1:/usr/share/elasticsearch/logs:rw \
    --network elasticsearch-br0 \
    --ip 172.16.0.11 \
    -p 9201:9200 -p 9301:9300 \
    elasticsearch:7.16.2

docker run -d --name elasticsearch2 \
    -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    -v "$(pwd)"/elasticsearch2.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro \
    -v es-data2:/usr/share/elasticsearch/data:rw \
    -v es-logs2:/usr/share/elasticsearch/logs:rw \
    --network elasticsearch-br0 \
    --ip 172.16.0.12 \
    -p 9202:9200 -p 9302:9300 \
    elasticsearch:7.16.2

docker run -d --name elasticsearch3 \
    -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    -v "$(pwd)"/elasticsearch3.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro \
    -v es-data3:/usr/share/elasticsearch/data:rw \
    -v es-logs3:/usr/share/elasticsearch/logs:rw \
    --network elasticsearch-br0 \
    --ip 172.16.0.13 \
    -p 9203:9200 -p 9303:9300 \
    elasticsearch:7.16.2
```
