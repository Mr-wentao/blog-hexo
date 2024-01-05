---
title: redis-cli常用命令
date: 2024-01-02 14:17:58
tags:
---

**redis登录**

```bash
$ 指定ip、端口、密码
redis-cli -h [ip] -p [port] -a [pwd]
$ 指定ip、端口、密码并清理redis缓存
redis-cli -h [ip] -p [port] -a [pwd] flushall
$ 指定ip、端口、密码、数据库
redis-cli -h [ip] -p [port] -a [pwd] -n [db_number]
```
**登录redis控制台操作**

```
切换到DB 1；redis有16个DB，编号0到15，默认使用0
select 1
验证登录
auth [password]
查看当前库的key的数量
dbsize
删除当前库的全部数据
flushdb
删除所有库的全部数据
flushall

```
**redis key相关命令**
```
查看当前库的全部key
keys *

判断某个key是否存在，存在返回1，不存在返回0
exists [key]

查看某个key的类型，如果key不存在，则返回none
type [key]

删除指定的key数据，成功返回1，失败返回0
del [key]

根据value选择非阻塞删除，仅将keys从keyspace元数据中删除，真正的删除后在后续异步操作
unlink [key]

查看某个key的过期时间，单位（秒），-1表示永不过期，-2表示已经过期
ttl [key]

给指定的key设置过期时间，单位（秒）
expire [key] 10

```
