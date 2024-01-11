---
title: ElasticSearch二进制tar包部署
categories:
  - 基础运维
tags:
  - ElasticSearch
  - ES
cover: 'https://static.zahui.fan/public/elasticsearch.svg'
abbrlink: a07ebcb
date: 2022-11-02 12:48:18
---

## 修改主机名

```bash
hostnamectl set-hostname es_1
hostnamectl set-hostname es_2
hostnamectl set-hostname es_3
```

## 创建目录

```bash
[ ! -d /data/server ] && mkdir -p /data/elasticsearch
cd /data/elasticsearch
```

## 下载软件安装包

```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.16.2-linux-x86_64.tar.gz
wget https://artifacts.elastic.co/downloads/kibana/kibana-7.16.2-linux-x86_64.tar.gz
tar xf elasticsearch-7.16.2-linux-x86_64.tar.gz
tar xf kibana-7.16.2-linux-x86_64.tar.gz
```

## 创建用户

```bash
sudo useradd elasticsearch -m -s /usr/sbin/nologin
chown -R elasticsearch:elasticsearch /data/elasticsearch
```

## 修改配置

vi config/elasticsearch.yml

修改配置文件为

```yml
cluster.name: es_cluster
node.name: node-1/node-3/node-3                   # 每个节点定义个名字
network.host: 192.168.21.71                       # 每个节点监听的ip
http.port: 9200
discovery.seed_hosts: ["192.168.21.71", "192.168.21.72", "192.168.21.73"]     # 填些所有节点的ip地址
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]                  # 每个节点的 node.mane 配置
xpack.security.enabled: true
transport.tcp.port: 9300
http.cors.enabled: true
http.cors.allow-origin: "*"
```

## 生成启动脚本

```bash
cat > /usr/lib/systemd/system/elasticsearch.service <<EOF
[Unit]
Description=elasticsearch
After=network.target

[Service]
Type=simple
User=elasticsearch
Group=elasticsearch
LimitNOFILE=100000
LimitNPROC=100000
Restart=no
ExecStart=/data/elasticsearch/elasticsearch-7.16.2/bin/elasticsearch
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
```

## 开启认证

### 生成证书

> 在一个master上执行即可, 所有选项全部保持默认

```bash
cd /data/elasticsearch/elasticsearch-7.16.2
./bin/elasticsearch-certutil ca
./bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12
```

### 复制证书

>把生成的文件放到conf下

```bash
chown elasticsearch:elasticsearch elastic-certificates.p12  elastic-stack-ca.p12
mv elastic-certificates.p12  elastic-stack-ca.p12 config/
```

然后把这两个文件复制到其他的节点config目录下.

### 修改配置文件

```bash
http.cors.allow-headers: Authorization
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: elastic-certificates.p12
```

然后挨个节点重启ElasticSearch

### 设置密码

{% tabs TabName %}

<!-- tab 自动生成所有密码 -->
```bash
./bin/elasticsearch-setup-passwords auto
```
<!-- endtab -->

<!-- tab 手动设置每个密码 -->
```bash
./bin/elasticsearch-setup-passwords interactive
```
<!-- endtab -->

{% endtabs %}
