---
title: ES开启安全认证
categories:
  - devops
abbrlink: 573776b5
date: 2024-01-02 14:17:58
tags:
---

**elasticsearch开启安全认证步骤**

***1.创建证书***
```bash
进入到es主目录下执行
./bin/elasticsearch-certutil ca Elasticsearch开启安全认证详细步骤
第一个证书名称默认，直接回车
第二个输入密码，直接回车
完成后会生成一个文件：elastic-stack-ca.p12
```
***2.根据生成的证书创建秘钥***

```
./bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12
同样的步骤，一直回车下去会生成elastic-certificates.p12秘钥文件
```
***3.开启认证***
```
依次把elastic-certificates.p12文件复制到各个节点的config目录下并授权
chown -R elastic:elastic elastic-certificates.p12

vim elasticsearch.yml

cluster.name: test-es
node.name: node-1  #每个节点名称不同
network.host: 0.0.0.0
http.port: 9200
discovery.seed_hosts: ["es1", "es2", "es3"]
cluster.initial_master_nodes: ["es1", "es2", "es3"]
transport.tcp.port: 9300
http.cors.enabled: true
http.cors.allow-origin: "*"
cluster.routing.allocation.disk.watermark.flood_stage: 95%

#添加以下配置
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: elastic-certificates.p12
```
***4.启动es并创建密码***
```
依次启动es之后在一个节点执行
./bin/elasticsearch-setup-passwords auto
会自动生成以下账户密码
elastic，apm_system，kibana，kibana_system，logstash_system，beats_system
```
**至此ES开启认证完成**