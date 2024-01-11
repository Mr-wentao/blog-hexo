---
title: 二进制安装MySQL5.7
abbrlink: 3b23b5cb
cover: 'https://static.zahui.fan/images/202211012250095.svg'
categories:
  - 数据库
tags:
  - 配置记录
  - MySQL
date: 2022-08-14 11:41:08
---
如有特殊需求需要编译安装MySQL请看[编译安装MySQL5.7](/posts/b670229a)

## 准备工作

### 卸载系统中的MySQL或mariadb

```bash
rpm -qa | grep mysql
rpm -qa | grep mariadb
yum remove xxx
```

### 下载二进制安装包

[MySQL官网](https://dev.mysql.com/downloads/mysql/5.7.html#downloads)

选择操作系统为 `Linux-Generic`

选择下载文件名为：`mysql-5.7.39-linux-glibc2.12-x86_64.tar.gz`

当然也可以用wget直接下载

```bash
wget https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.39-linux-glibc2.12-x86_64.tar.gz
```

### 创建用户

```bash
useradd -M -s /sbin/nologin -r mysql
```

### 安装依赖包

为了避免执行mysql命令报错`ibncurses.so.5`或者`libnuma.so.1`找不到

{% tabs TabName %}

<!-- tab CentOS -->

```bash
yum install -y ncurses-devel numactl-libs
```

<!-- endtab -->

<!-- tab Ubuntu -->

```bash
apt install -y libncurses5
```

<!-- endtab -->
{% endtabs %}

### 设置安装路径

```bash
export BASE_DIR="/usr/local/mysql"
export DATA_DIR="/data/mysql"
```

### 解压安装包

```bash
tar -xf mysql-5.7.39-linux-glibc2.12-x86_64.tar.gz -C /usr/local/
ln -s ${BASE_DIR}-5.7.39-linux-glibc2.12-x86_64/ ${BASE_DIR}
```

## 初始化数据库

### 创建数据保存目录

```bash
mkdir -p ${DATA_DIR}/{binlog,data,logs,redolog,relaylog,tmp,undolog}
mkdir -p ${BASE_DIR}/etc
chown -R mysql.mysql ${DATA_DIR}
touch ${DATA_DIR}/logs/error_mysqld.log
chown -R mysql.mysql ${DATA_DIR}/logs/error_mysqld.log
chown -R mysql.mysql ${BASE_DIR}
chown -R mysql.mysql ${BASE_DIR}-5.7.39-linux-glibc2.12-x86_64/
```

### initialize

```bash
${BASE_DIR}/bin/mysqld --initialize --user=mysql --basedir=${BASE_DIR} --datadir=${DATA_DIR}/data
# 控制台会输出一个临时密码，需要记录一下
```

## 配置文件与服务

### 创建最小化配置文件

```bash
cat > ${BASE_DIR}/etc/my.cnf <<-EOF
## MySQL 5.7 Configuration File

[mysqld]

## General
user                                   = mysql
bind_address                           = 0.0.0.0
port                                   = 3306
basedir                                = ${BASE_DIR}/
datadir                                = ${DATA_DIR}/data
tmpdir                                 = ${DATA_DIR}/tmp
socket                                 = ${DATA_DIR}/logs/mysql.sock
pid-file                               = ${DATA_DIR}/logs/mysqld.pid

character_set_server                   = utf8

skip-symbolic-links
skip_name_resolve                      = ON
skip_external_locking                  = ON

performance_schema                     = ON      # default ON
performance-schema-instrument          = 'memory/%=ON'
#lower_case_table_names                 = 0      # default 0


### Storage Engines
default_storage_engine                 = InnoDB

## InnoDB
innodb_log_group_home_dir              = ${DATA_DIR}/redolog/
innodb_log_file_size                   = 256M
innodb_log_files_in_group              = 2
innodb_log_buffer_size                 = 16M
innodb_rollback_segments               = 128     # defautl 128
innodb_undo_directory                  = ${DATA_DIR}/undolog/
innodb_open_files                      = 4000
innodb_thread_concurrency              = 32
innodb_flush_log_at_trx_commit         = 1
innodb_flush_log_at_timeout            = 1       # defautl 1, when innodb_flush_log_at_trx_commit = 0 or 2
innodb_purge_threads                   = 4
innodb_print_all_deadlocks             = ON
innodb_max_dirty_pages_pct             = 70
innodb_lock_wait_timeout               = 50
innodb_flush_method                    = O_DIRECT
innodb_old_blocks_time                 = 1000    # since 5.6.6 default 1000
innodb_io_capacity                     = 600     # default 200
innodb_io_capacity_max                 = 2000    # default 2000
innodb_lru_scan_depth                  = 1024    # default 1024
innodb_read_io_threads                 = 8
innodb_write_io_threads                = 8
innodb_buffer_pool_load_at_startup     = ON
innodb_buffer_pool_dump_at_shutdown    = ON
innodb_buffer_pool_filename            = ib_buffer_pool  # default ib_buffer_pool
innodb_sort_buffer_size                = 64M     # default 1M , 64K - 64M , for change index

innodb_buffer_pool_dump_pct            = 40
innodb_page_cleaners                   = 16
innodb_undo_log_truncate               = ON
innodb_max_undo_log_size               = 2G
innodb_purge_rseg_truncate_frequency   = 128

## Gtid
#gtid_mode                              = ON
#enforce_gtid_consistency               = ON
#binlog_gtid_simple_recovery            = 1

## Replication
server_id                              = 101
log_bin                                = ${DATA_DIR}/binlog/mysql_bin
expire_logs_days                       = 7
binlog_format                          = ROW
binlog_row_image                       = noblob  # default full
#innodb_autoinc_lock_mode               = 2      # default 1
binlog_rows_query_log_events           = 1
max_binlog_size                        = 500M
binlog_cache_size                      = 1M
sync_binlog                            = 1
master_info_repository                 = TABLE
relay_log_info_repository              = TABLE
skip-slave-start                       = 1
relay_log                              = ${DATA_DIR}/relaylog/relay_log
max_relay_log_size                     = 500M   # default 0, use max_binlog_size
log_slave_updates                      = ON     # default OFF
slave_transaction_retries              = 128

## MTS
relay_log_recovery                     = 1

## Logging
log_output                             = FILE
slow_query_log                         = ON
slow_query_log_file                    = ${DATA_DIR}/logs/slow_mysqld.log
log_queries_not_using_indexes          = OFF     # default OFF
log_throttle_queries_not_using_indexes = 10      # default 0
min_examined_row_limit                 = 0       # default 0
log_slow_admin_statements              = ON
log_slow_slave_statements              = ON
long_query_time                        = 1
#log-short-format                       = 0
log_error                              = ${DATA_DIR}/logs/error_mysqld.log
general_log                            = OFF
general_log_file                       = ${DATA_DIR}/logs/general_mysqld.log
log_timestamps                         = system

## Index
ft_min_word_len                        = 4

[mysqld_safe]
open_files_limit                       = 65535

[mysql]
no_auto_rehash
prompt                                 = "MySQL [\\d] > "

[mysqldump]
quick
max_allowed_packet                     = 256M

[mysqlhotcopy]
interactive_timeout

[client]
socket                                 = ${DATA_DIR}/logs/mysql.sock

EOF
```

做软链接

```bash
ln -s ${BASE_DIR}/etc/my.cnf /etc/my.cnf
```

### 生成systemd配置

```bash
cat > /usr/lib/systemd/system/mysql.service <<-EOF
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=https://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target
[Install]
WantedBy=multi-user.target
[Service]
User=mysql
Group=mysql
ExecStart=${BASE_DIR}/bin/mysqld --defaults-file=/etc/my.cnf
LimitNOFILE = 5000
EOF
```

### 启动服务

```bash
systemctl enable --now mysql
```

## 优化工作

### 添加环境变量

```bash
echo "export PATH=\$PATH:${BASE_DIR}/bin" >> /etc/profile
```

### 修改root密码

```bash
# 第一次登录需要使用root@localhost登录，密码为上面生成的临时密码
mysql -uroot -hlocalhost -p
```

```sql
alter user 'root'@'localhost' IDENTIFIED BY 'Vb6CAEJqqtcmKndiAkEl';
CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'Vb6CAEJqqtcmKndiAkEl';
Grant all privileges on *.* to 'root'@'%' with grant option;
```
