---
title: 优雅地给正在运行的MySQL添加从库
abbrlink: 86a9c8f5
cover: 'https://static.zahui.fan/images/202211012250095.svg'
categories:
  - 数据库
tags:
  - MySQL
date: 2022-08-16 13:21:34
---

## 前言

之前写过一篇[MySQL主从同步配置](/posts/265ea5f9)给MySQL配置从库，在主库在使用的情况下，需要将主库进行禁止写入操作，然后再导出导入，如果库比较大的话， 会对业务造成一定的影响。这篇文章主要介绍如何不停机进行添加从库。

## 主库操作

### 开启binlog

```conf
[mysqld]
log_bin=mysql-bin
server-id=1
```

这里注意`server-id`主从不能一样, 配置完成重启mysql

### 创建用于同步的用户账号

登陆数据库

```bash
mysql -hlocalhost -uroot -ppassword
```

创建用户并授权

```sql
CREATE USER 'repl'@'%' IDENTIFIED BY '123456';
```

授权

```sql
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
flush privileges;
```

### 导出数据库sql

```bash
mysqldump -uroot -ppassword -hlocalhost -P3306 --master-data=2 --single-transaction --skip-tz-utc --all-databases > /tmp/db.sql
```

> --master-data 默认值为1，会将`CHANGE MASTER TO` 语句写入到sql文件中，如果将master-data设置为2，则会以注释写入到sql文件中。
> --single-transaction 在dump过程中保证数据的一致性，这个选项对InnoDB的数据表很有用，且不会锁表。但是这个不能保证MyISAM表和MEMORY表的数据一致性。

## 从库操作

### 导入数据库sql

```bash
mysql -uroot -ppassword -hlocalhost -P3306 < /tmp/db.sql
```

### 配置从库

```sql
CHANGE MASTER TO
  MASTER_HOST='10.91.15.131',
  MASTER_USER='repl',
  MASTER_PASSWORD='123456',
  MASTER_PORT=3306,
  MASTER_LOG_FILE='binlog.000008',              -- 这两个选项在 head -n 20 db.sql 就能看到
  MASTER_LOG_POS=22950585,                      -- 这两个选项在 head -n 20 db.sql 就能看到
  MASTER_HEARTBEAT_PERIOD=180,
  MASTER_CONNECT_RETRY=10;
```

### 启动从库

```sql
start slave;
show slave status \G;
```
