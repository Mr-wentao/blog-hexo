---
title: ElasticSearch升级版本
abbrlink: 74398d89
categories:
  - 日志
tags:
  - ElasticSearch
  - ES
cover: 'https://static.zahui.fan/public/elasticsearch.svg'
date: 2022-10-14 16:00:15
---

背景：es旧版本有log4j漏洞，需要进行升级处理，因为是使用yum安装的，升级也比较简单，这里记录一下，这里选择的版本是7.16.2

更新日志： https://www.elastic.co/guide/en/elasticsearch/reference/7.17/release-notes-7.16.2.html

## 首先下载安装包

阿里云镜像地址：<https://mirrors.aliyun.com/elasticstack/7.x/yum/7.16.2/>

腾讯云镜像地址：<https://mirrors.cloud.tencent.com/elasticstack/7.x/yum/7.16.2/>

## 安装

```bash
rpm -Uvh ./elasticsearch-7.16.2-x86_64.rpm
```

## 重新启动

```bash
systemctl daemon-reload
systemctl restart elasticsearch.service 
```

## 常见错误

java.lang.IllegalStateException: codebase property already set: codebase.jackson-annotations -> file:/usr/share/elasticsearch/modules/ingest-geoip/jackson-annotations-2.12.2.jar, cannot set to file:/usr/share/elasticsearch/modules/ingest-geoip/jackson-annotations-2.10.4.jar

> 这种情况是由于版本相差较大造成的。已经加载了一个版本的包，不能再加载另一个版本的包。

安装时的提示：

```
[root@l7---es-3 ~]# rpm -Uvh ./elasticsearch-7.16.2-x86_64.rpm 
warning: ./elasticsearch-7.16.2-x86_64.rpm: Header V4 RSA/SHA512 Signature, key ID d88e42b4: NOKEY
Preparing...                          ################################# [100%]
Updating / installing...
   1:elasticsearch-0:7.16.2-1         warning: /etc/elasticsearch/elasticsearch.yml created as /etc/elasticsearch/elasticsearch.yml.rpmnew
warning: /etc/elasticsearch/jvm.options created as /etc/elasticsearch/jvm.options.rpmnew
################################# [ 50%]
Cleaning up / removing...
   2:elasticsearch-0:7.5.0-1          warning: file /usr/share/elasticsearch/modules/ingest-geoip/jackson-databind-2.8.11.3.jar: remove failed: No such file or directory
warning: file /usr/share/elasticsearch/modules/ingest-geoip/jackson-annotations-2.8.11.jar: remove failed: No such file or directory
################################# [100%]

```

这里很明显是安装的时候安装脚本会移除旧的jar包，但是没有找到这个文件

解决方案：

cd /usr/share/elasticsearch/modules/ingest-geoip/

删除旧版本的jar包

