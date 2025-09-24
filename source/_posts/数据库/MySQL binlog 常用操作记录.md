---
title: MySQL Binlog 常用操作记录
abbrlink: 4d67bced
cover: 'https://s3.babudiu.com/iuxt//images/202211012250095.svg'
categories:
  - 数据库
tags:
  - MySQL
  - binlog
date: 2022-10-02 22:13:43
---

本文记录一些日常使用MySQL binlog的命令记录，方便日后查询。

## 开启binlog日志(在[mysqld]下修改或添加如下配置)

```ini
server-id=1
log-bin=mysql-bin
binlog_format=MIXED
```

## binlog日志模式

```text
Mysql复制主要有三种方式：基于SQL语句的复制(statement-based replication, SBR)，基于行的复制(row-based replication, RBR)，混合模式复制(mixed-based replication, MBR)。对应的，binlog的格式也有三种：STATEMENT，ROW，MIXED。

1、STATEMENT模式（SBR）
每一条会修改数据的sql语句会记录到binlog中。优点是并不需要记录每一条sql语句和每一行的数据变化，减少了binlog日志量，节约IO，提高性能。缺点是在某些情况下会导致master-slave中的数据不一致(如sleep()函数， last_insert_id()，以及user-defined functions(udf)等会出现问题)

2、ROW模式（RBR）
不记录每条sql语句的上下文信息，仅需记录哪条数据被修改了，修改成什么样了。而且不会出现某些特定情况下的存储过程、或function、或trigger的调用和触发无法被正确复制的问题。缺点是会产生大量的日志，尤其是alter table的时候会让日志暴涨。

3、MIXED模式（MBR）
以上两种模式的混合使用，一般的复制使用STATEMENT模式保存binlog，对于STATEMENT模式无法复制的操作使用ROW模式保存binlog，MySQL会根据执行的SQL语句选择日志保存方式。
```

### 查看binlog格式

```sql
show variables like 'BINLOG_FORMAT';
```

### 修改binlog格式

{% tabs TabName %}

<!-- tab 不停服务修改 -->
编辑/etc/my.cnf文件，加入以下设置

```ini
binlog_format=row
```

在MySQL命令行执行

```sql
set global binlog_format=ROW;
```

<!-- endtab -->

<!-- tab 停服修改 -->

编辑/etc/my.cnf文件，加入以下设置

```ini
binlog_format=row
```

重启MySQL服务器

<!-- endtab -->

{% endtabs %}

## 查看默认的日志保存天数

```sql
show variables like '%expire_logs_days%';

0-表示永不过期
```

## 设置为7天有效期(修改配置文件)

```ini
expire_logs_days=7
```

## binlog使用

### 常用sql命令

```sql
/* 查看binlog是否开启 */
show variables like 'log_%';

/* 查看binlog列表 */
show binary logs;

/* 查看正在写入的binlog文件 */
show master status \G
```

### 查看某个时间段的sql操作

```bash
# idk_base 是库名, 需要进入到binlog文件所在的目录
mysqlbinlog --base64-output=decode-rows --start-datetime='2022-11-09 10:48:40' --stop-datetime='2022-11-09 10:49:00' -v -d idk_base binlog.000009
```

## 关闭binlog

在 my.cnf 配置文件 [mysqld] 下 增加:

```ini
disable-log-bin
```

然后重启mysql服务
