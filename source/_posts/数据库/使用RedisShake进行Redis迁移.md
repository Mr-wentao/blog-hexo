---
title: 使用RedisShake进行Redis迁移
categories:
  - 数据库
tags:
  - 数据迁移
  - redis
abbrlink: lmojvw5l
date: 2023-09-18 15:14:06
---
对于自建的redis, 我们可以将rdb/aof文件拷贝到目的redis, 启动恢复, 但是云redis或者某些特殊情况, 比如没有云平台的权限等等情况, 可以使用工具来进行迁移.

RedisShake 是阿里云 Tair 团队 积极维护的一个项目。它的演变可以追溯到其初始版本，该版本是从 redis-port 分支出来的。官方文档<https://tair-opensource.github.io/RedisShake/zh/guide/introduction.html>

## 安装

```bash
wget https://github.com/tair-opensource/RedisShake/releases/download/v4.0.0/redis-shake-linux-amd64.tar.gz
tar xf redis-shake-linux-amd64.tar.gz
```

## 同步迁移

创建一个配置文件 `redis_sync.toml`

```toml
[sync_reader]
cluster = false            # 是否为集群
address = "127.0.0.1:6379"
username = ""              # keep empty if not using ACL
password = ""              # keep empty if no authentication is required
tls = false

[redis_writer]
cluster = false
address = "127.0.0.1:6380"
username = ""              # keep empty if not using ACL
password = ""              # keep empty if no authentication is required
tls = false
```

执行迁移操作, 命令会在后台进行监听, 同步redis的变化, 迁移完成再关闭此服务.

```bash
./redis-shake ./redis_sync.toml
```
## 使用RDB文件迁移

先在源redis导出rdb文件, 上传到一台linux机器(可以访问目标redis), 然后执行迁移.

配置文件:
```toml
[rdb_reader]
filepath = "/tmp/dump.rdb"

[redis_writer]
cluster = false
address = "127.0.0.1:6380"
username = ""              # keep empty if not using ACL
password = ""              # keep empty if no authentication is required
tls = false
```

执行迁移操作:
```bash
./redis-shake ./redis_sync.toml
```
