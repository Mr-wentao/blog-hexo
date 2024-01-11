---
title: MySQL慢查询日志
categories:
  - 数据库
tags:
  - mysql
  - MySQL
abbrlink: d7f12bf0
cover: 'https://static.zahui.fan/images/202211012250095.svg'
date: 2023-07-20 16:31:08
---

开启慢查询会带来一定的性能影响。
参考: <http://c.biancheng.net/view/7782.html>

## 查询慢查询日志功能状态

默认情况下，慢查询日志功能是关闭的。可以通过以下命令查看是否开启慢查询日志功能。命令和执行过程如下：

```sql
mysql> SHOW VARIABLES LIKE 'slow_query%';
+---------------------+---------------------------------------------------------------------+
| Variable_name       | Value                                                               |
+---------------------+---------------------------------------------------------------------+
| slow_query_log      | OFF                                                                 |
| slow_query_log_file | C:\ProgramData\MySQL\MySQL Server 5.7\Data\LAPTOP-UHQ6V8KP-slow.log |
+---------------------+---------------------------------------------------------------------+
2 rows in set, 1 warning (0.02 sec)

mysql> SHOW VARIABLES LIKE 'long_query_time';
+-----------------+-----------+
| Variable_name   | Value     |
+-----------------+-----------+
| long_query_time | 10.000000 |
+-----------------+-----------+
1 row in set, 1 warning (0.01 sec)
```

slow_query_log：        慢查询开启状态
slow_query_log_file：   慢查询日志存放的位置（一般设置为 MySQL 的数据存放目录）
long_query_time：       查询超过多少秒才记录


## 启动和设置慢查询日志

可以通过 log-slow-queries 选项开启慢查询日志。通过 long_query_time 选项来设置时间值，时间以秒为单位。如果查询时间超过了这个时间值，这个查询语句将被记录到慢查询日志。

### 修改配置文件方式

将 log_slow_queries 选项和 long_query_time 选项加入到配置文件的 [mysqld] 组中。格式如下：

```ini
[mysqld]
log-slow-queries=/data/mysql/slow.log
long_query_time=5

# log-slow-queries 参数指定慢查询日志的存储路径，如果是相对路径，慢查询日志将存储到 MySQL 数据库的数据文件夹下。如果不指定文件名，默认文件名为 hostname-slow.log，hostname 是 MySQL 服务器的主机名。
# long_query_time 参数是设定的时间值，该值的单位是秒。如果不设置 long_query_time 选项，默认时间为 10 秒。
```

### 执行sql命令方式

```sql
SET GLOBAL slow_query_log=ON/OFF;
SET GLOBAL long_query_time=5;
```

## 删除慢查询日志

慢查询日志的删除方法与通用日志的删除方法是一样的。可以使用 mysqladmin 命令来删除。也可以使用手工方式来删除。mysqladmin 命令的语法如下：

```bash
mysqladmin -uroot -p flush-logs
```

执行该命令后，命令行会提示输入密码。输入正确密码后，将执行删除操作。