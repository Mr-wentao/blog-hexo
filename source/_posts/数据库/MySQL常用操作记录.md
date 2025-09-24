---
title: MySQL常用操作记录
abbrlink: fa013442
cover: 'https://s3.babudiu.com/iuxt//images/202211012250095.svg'
categories:
  - 数据库
tags:
  - MySQL
  - SQL
  - 配置记录
date: 2022-04-22 00:43:48
---

记录一下日常工作中常用到的MySQL语句和一些配置等，方便日后查询

## 用户授权相关

### 创建用户

{% tabs TabName %}

<!-- tab MySQL 5.7及以下版本 -->

```sql
CREATE USER 'root'@'%' IDENTIFIED BY '123456';
```

<!-- endtab -->

<!-- tab MySQL 8.0 -->

```sql
CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
```

<!-- endtab -->
{% endtabs %}

### 修改密码

{% tabs TabName %}

<!-- tab MySQL 5.7及以下版本 -->

```sql
ALTER USER 'root'@'%' IDENTIFIED BY '123456';
```

<!-- endtab -->

<!-- tab MySQL 8.0 -->

```sql
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
```

<!-- endtab -->
{% endtabs %}

### 授权

```sql
Grant all privileges on *.* to 'root'@'%' with grant option;
```

### 授权的同时修改密码

```sql
Grant all privileges on *.* to 'root'@'%' identified by '123456' with grant option;
```

### 创建只读账号

{% tabs TabName %}

<!-- tab MySQL5.7 -->
```sql
GRANT SElECT ON *.* TO 'read_only'@'ip' IDENTIFIED BY "password"
```
<!-- endtab -->

<!-- tab MySQL8.0 -->
```sql
CREATE USER 'read_only'@'ip' IDENTIFIED BY 'password';
GRANT SELECT ON *.* TO 'read_only'@'ip' WITH GRANT OPTION;

/* 删除权限 */
/* REVOKE all privileges ON *.* FROM 'read_only_user'@'ip'; */
```
<!-- endtab -->

{% endtabs %}

## 库相关

### 建库

```sql
CREATE DATABASE `idp_app` CHARACTER SET 'utf8' COLLATE 'utf8_general_ci';
CREATE DATABASE `idp_sdk` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_general_ci';
```

## 配置文件相关

apt安装的mysql配置文件在`/etc/mysql/mysql.conf.d/mysqld.cnf`

### 初始化密码

> ubuntu系统通过apt安装的mysql，需要切换到root，然后执行mysql命令就可以登录（不用密码），对应的用户是`root@localhost`  
> 当然也可以`cat /etc/mysql/debian.cnf`查看密码。

### 表名强制转换为小写

仅适用于MySQL 5.7 及以下版本，到了 8.0，只支持初始化时指定该参数，初始化之后，如果修改了该参数，启动就会报错。

配置文件在[mysqld]下面新增一行

```ini
[mysqld]
lower_case_table_names = 1
```

可以通过执行sql查看是否设置成功

```sql
show variables like 'lower_case_table_names';
```

### 查看建库建表语句

```sql
show create database django;
show create table django.auth_user;
```

## binlog

查看binlog状态

```sql
MySQL [(none)] > show variables like 'log_bin%';
+---------------------------------+------------------------------------+
| Variable_name                   | Value                              |
+---------------------------------+------------------------------------+
| log_bin                         | ON                                 |
| log_bin_basename                | /data/mysql/binlog/mysql_bin       |
| log_bin_index                   | /data/mysql/binlog/mysql_bin.index |
| log_bin_trust_function_creators | OFF                                |
| log_bin_use_v1_row_events       | OFF                                |
+---------------------------------+------------------------------------+
5 rows in set (0.02 sec)

```

查看binlog模式

```sql
MySQL [(none)] > show variables like '%binlog_format%';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| binlog_format | ROW   |
+---------------+-------+
1 row in set (0.00 sec)
```

binlog配置文件

```ini
[mysqld]
server_id = 1
log_bin = /var/log/mysql/mysql-bin.log
max_binlog_size = 1G
binlog_format = row
binlog_row_image = full
```

## 排序

```sql
SELECT * from runoob_tbl ORDER BY submission_date ASC;  # 升序
SELECT * from runoob_tbl ORDER BY submission_date DESC;   # 降序
```

## 批量kill慢查询

```sql
-- 查询哪些查询时间大于20秒
select *  from information_schema.processlist where COMMAND='Query' AND time > 20;
-- 批量kill慢查询
select concat('KILL ',id,';') from information_schema.processlist where COMMAND='Query' AND time > 20;
```

复制输出的结果， 再执行

## 查看版本

### 查看变量的方式

```sql
show variables like '%version%';
```

### mysql命令行执行命令的方式

```sql
status
```

### 使用MySQL函数方式：

```sql
select version();
```

## 查看哪些库使用的是MyISAM引擎

查询哪些表引擎是MyISAM
```sql
SELECT TABLE_SCHEMA as DbName ,TABLE_NAME as TableName ,ENGINE as Engine FROM information_schema.TABLES WHERE ENGINE='MyISAM' AND TABLE_SCHEMA NOT IN('mysql','information_schema','performance_schema');
```

生成 `ALTER` 语句来转换到 `InnoDB`
```sql
SELECT CONCAT('ALTER TABLE ', TABLE_SCHEMA,'.',TABLE_NAME, ' ENGINE = InnoDB;') FROM information_schema.TABLES WHERE ENGINE='MyISAM' AND TABLE_SCHEMA NOT IN('mysql','information_schema','performance_schema');
```