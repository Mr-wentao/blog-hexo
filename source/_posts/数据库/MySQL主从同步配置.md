---
title: MySQL主从同步配置
abbrlink: 265ea5f9
description: 主从同步可以相当于实时备份，读写分离还能提高数据库的性能，记录一下主从同步的配置。
cover: 'https://static.zahui.fan/images/202211012250095.svg'
categories:
  - 数据库
tags:
  - MySQL
  - database
date: 2022-04-27 22:01:34
---

主从同步可以相当于实时备份，读写分离还能提高数据库的性能，记录一下主从同步的配置

不停机增加从库可以查看[优雅地给正在运行的MySQL添加从库](/posts/86a9c8f5)

## 一.准备

- 主从数据库版本最好一致
- 保证数据库的uuid不一致

| 服务器       | ip地址        |
| ------------ | ------------- |
| MySQL Master | 192.168.21.53 |
| MySQL Slave  | 192.168.21.54 |



## 二.操作

### 主数据库操作

#### 开启binlog

```conf
[mysqld]
log_bin=mysql-bin
server-id=1
```

这里注意`server-id`主从不能一样, 配置完成重启mysql

#### 创建用于同步的用户账号

登陆数据库

```bash
mysql -hlocalhost -uroot -ppassword
```

创建用户并授权

```sql
CREATE USER 'repl'@'%' IDENTIFIED BY 'A4MyDNdzpHvg5M02KRtm';
```

授权

```sql
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
flush privileges;
```

{% tabs TabName %}

<!-- tab 未使用的主库 -->

新开一个窗口查看master状态

```sql
SHOW MASTER STATUS;
+------------------+----------+--------------+------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+----------+--------------+------------------+
| mysql-bin.000010 | 747      |              |                  |
+------------------+----------+--------------+------------------+ 
```

记录二进制文件名(mysql-bin.000010)和位置(747)

<!-- endtab -->

<!-- tab 主库正在使用（有写入操作） -->

锁表，禁止写入，当前窗口不能退出，这时候开启另一个终端继续操作

```sql
flush table with read lock;
```

新开一个窗口查看master状态

```sql
SHOW MASTER STATUS;
+------------------+----------+--------------+------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+----------+--------------+------------------+
| mysql-bin.000010 | 747      |              |                  |
+------------------+----------+--------------+------------------+ 
```

记录二进制文件名(mysql-bin.000010)和位置(747)

将当前数据导出

```bash
mysqldump -u root -p --all-databases > /root/backup.sql
```

取消锁表

```sql
unlock table;
```

<!-- endtab -->
{% endtabs %}

### 从服务器操作

导入数据（如果需要的话）

```bash
mysql -uroot -p < backup.sql
```

修改配置文件

`vim /etc/my.cnf`

```conf
[mysqld]
server-id=2 
```

`server-id`必须和主数据库不一致，修改完成后重启mysql

配置从数据库

```sql
CHANGE MASTER TO MASTER_HOST='192.168.21.53', MASTER_USER='repl', MASTER_PASSWORD='A4MyDNdzpHvg5M02KRtm', MASTER_LOG_FILE='mysql-bin.000010', MASTER_LOG_POS=747;
start slave;
```

查看slave状态：

```sql
show slave status\G;
```

```text
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 192.168.21.53
                  Master_User: repl
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000010
          Read_Master_Log_Pos: 1055                                           # 表示当前同步到了什么位置
               Relay_Log_File: prod_cukin_mysql_slave-relay-bin.000003
                Relay_Log_Pos: 628
        Relay_Master_Log_File: mysql-bin.000010
             Slave_IO_Running: Yes                                            # 是Yes表示配置成功
            Slave_SQL_Running: Yes                                            # 是Yes表示配置成功
```

## 常见问题

### uuid一致问题

很多时候我们是直接克隆的机器做从库，这个时候两台mysql机器的uuid就是一样的没办法做主从同步，会报错

`The slave I/O thread stops because master and slave have equal MySQL server UUIDs; these UUIDs must be different for replication to work`

uuid 可以通过以下sql来查看

```sql
show variables like '%server_uuid%';
```

这个时候需要修改uuid，规范一点可以使用`uuidgen`来生成一个新的uuid，配置在mysql的数据目录auto.cnf文件内

### 重新同步

如果需要停止同步，比如更换了同步所用到的密码，则需要：

停止slave进程, 在slave上执行：

```sql
stop slave;
```

记录当前的Read_Master_Log_Pos, 在slave上执行：

```sql
show slave status \G
```

重新配置同步，在slave上执行：

```sql
CHANGE MASTER TO MASTER_HOST='192.168.21.53', MASTER_USER='repl', MASTER_PASSWORD='A4MyDNdzpHvg5M02KRtm', MASTER_LOG_FILE='mysql-bin.000010', MASTER_LOG_POS=747;
```

开始同步

```sql
start slave;
```

## 禁止从库更新数据

super_read_only 和 read_only 的区别
1. read_only参数和super_read_only参数默认都是关闭的，read_only参数设置为on的情况下，会组织客户端的更新，但是如果一个账号拥有super权限，那么还是可以进行更新的。而super_read_only会阻止所有的客户端更新，即使客户端拥有super权限也不可以。
2. 设置super_read_only参数为on会默认联动的设置read_only为on
3. 设置read_only参数为off，会默认联动设置super_read_only为off

### 查看现有的配置

```sql
show variables like '%read_only%';
```

### 设置readonly

```sql
set global super_read_only=on;
```


### 修改配置文件，永久生效

```ini
[mysqld]
read-only
```