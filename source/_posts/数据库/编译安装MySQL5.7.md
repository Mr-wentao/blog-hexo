---
title: 编译安装MySQL5.7
abbrlink: b670229a
cover: 'https://static.zahui.fan/images/202211012250095.svg'
categories:
  - 数据库
tags:
  - 配置记录
  - MySQL
date: 2022-07-05 15:16:12
---

编译需要耗时，且对系统的依赖更为复杂，更容易出错， 如果没有必要，可以参考使用[二进制安装MySQL5.7](/posts/3b23b5cb)

## 安装编译依赖

{% tabs OS %}

<!-- tab Ubuntu和Debian -->

```bash
sudo apt-get install -y build-essential cmake libaio-dev libncurses5-dev pkg-config
```

<!-- endtab -->

<!-- tab CentOS和Fedora -->

```bash
sudo yum -y install zlib-devel openssl-devel libaio-devel ncurses-devel cmake gcc-c++
```

<!-- endtab -->

{% endtabs %}

## 编译

### 设置安装路径

```bash
export BASE_DIR="/usr/local/mysql"
export DATA_DIR="/data/mysql"
```

### 准备工作

```bash
wget https://cdn.mysql.com//Downloads/MySQL-5.7/mysql-boost-5.7.38.tar.gz
tar xf mysql-boost-5.7.38.tar.gz && cd mysql-5.7.38
[[ -d build ]] && rm -r build
mkdir -p build && cd build
```

### 开始编译

```bash
cmake .. \
    -DBUILD_CONFIG=mysql_release \
    -DFEATURE_SET="community" \
    -DCMAKE_INSTALL_PREFIX="${BASE_DIR}" \
    -DWITH_EMBEDDED_SERVER=off \
    -DINSTALL_SBINDIR=bin \
    -DINSTALL_SCRIPTDIR=bin \
    -DINSTALL_LIBDIR=lib/mysql \
    -DINSTALL_PLUGINDIR=lib/plugin \
    -DINSTALL_INCLUDEDIR=include \
    -DINSTALL_INFODIR=share/info \
    -DINSTALL_MANDIR=share/man \
    -DINSTALL_MYSQLSHAREDIR=share/mysql \
    -DINSTALL_SUPPORTFILESDIR=share/mysql \
    -DINSTALL_MYSQLTESTDIR=mysql-test \
    -DDEFAULT_CHARSET=utf8 \
    -DDEFAULT_COLLATION=utf8_general_ci \
    -DEXTRA_CHARSETS=all \
    -DENABLED_LOCAL_INFILE=ON \
    -DWITH_LIBEVENT=bundled \
    -DWITH_SSL=bundled \
    -DWITH_ZLIB=bundled \
    -DWITH_INNODB_MEMCACHED=on \
    -DWITH_BOOST=../boost \
    -DWITH_UNIT_TESTS=on \
    -DWITH_DEBUG=off

make -j4 && make install
# 根据cpu核心数设置，直接make也行
```

## 收尾

### 创建目录和用户

```bash
mkdir -p ${DATA_DIR}/{binlog,data,logs,redolog,relaylog,tmp,undolog}
mkdir -p ${BASE_DIR}/etc
groupadd -g 27 -o -r mysql
useradd -M -g mysql -o -r -d /dev/null -s /sbin/nologin -u 27 mysql 
chown -R mysql.mysql ${DATA_DIR}
```

### 创建配置文件

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
sql_mode                               = NO_ENGINE_SUBSTITUTION  # default "STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION
transaction_isolation                  = READ-COMMITTED    # default REPEATABLE-READ
explicit_defaults_for_timestamp        = ON     # default OFF
secure_file_priv                       =

skip-symbolic-links
skip_name_resolve                      = ON
skip_external_locking                  = ON

performance_schema                     = ON      # default ON
performance-schema-instrument          = 'memory/%=ON'
autocommit                             = ON      # default ON
#event_scheduler                        = ON     # default OFF
#lower_case_table_names                 = 0      # default 0
show_compatibility_56                  = ON      # >= 5.7.8 default OFF

## ssl
#ssl_ca                                 = ${DATA_DIR}/ssl/ca.pem
#ssl_cert                               = ${DATA_DIR}/ssl/server-cert.pem
#ssl_key                                = ${DATA_DIR}/ssl/server-key.pem

## Networking
back_log                               = 1000
max_connections                        = 1100
max_user_connections                   = 1000
max_connect_errors                     = 1000000
interactive_timeout                    = 300
wait_timeout                           = 300
connect_timeout                        = 10
net_buffer_length                      = 1M
max_allowed_packet                     = 256M

## Cache
thread_cache_size                      = 192     # since 5.6.8 default -1, autosized ( max_connections / 100 ) + 8
table_open_cache                       = 4096
table_definition_cache                 = 4096
table_open_cache_instances             = 8
query_cache_type                       = 0
query_cache_size                       = 0
#query_cache_size                       = 32M
#query_cache_limit                      = 1M
#query_cache_min_res_unit               = 2K

## Per_thread Buffers
sort_buffer_size                       = 32M     # default 256K
read_buffer_size                       = 16M     # default 256K
read_rnd_buffer_size                   = 32M     # default 256K
join_buffer_size                       = 128M    # default 256K
bulk_insert_buffer_size                = 64M
thread_stack                           = 256K    # default 192K

## Temp Tables
tmp_table_size                         = 512M
max_heap_table_size                    = 512M

## Sort
max_length_for_sort_data               = 2048    # default 1024
eq_range_index_dive_limit              = 200     # default 10

### Storage Engines
default_storage_engine                 = InnoDB

## InnoDB
innodb_file_per_table                  = ON
innodb_file_format_check               = ON
innodb_checksum_algorithm              = crc32
innodb_page_size                       = 16k     # default 16k
innodb_buffer_pool_size                = 2G      # default 1G, = innodb_buffer_pool_instances * innodb_buffer_pool_chunk_size * n
innodb_buffer_pool_instances           = 8       # since 5.6.6 if innodb_buffer_pool_size < 1G default 1 else 8
innodb_buffer_pool_chunk_size          = 128M    # defautl 128M
innodb_data_file_path                  = ibdata1:100M:autoextend
innodb_temp_data_file_path             = ../tmp/ibtmp1:12M:autoextend
innodb_log_group_home_dir              = ${DATA_DIR}/redolog/
innodb_log_file_size                   = 256M
innodb_log_files_in_group              = 2
innodb_log_buffer_size                 = 16M
innodb_rollback_segments               = 128     # defautl 128
innodb_undo_directory                  = ${DATA_DIR}/undolog/
innodb_undo_tablespaces                = 4       # from 5.7.21 deprecated
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
#read_only                              = ON
#super_read_only                        = ON
#relay_log_purge                        = 1
#slave_net_timeout                      = 60
#replicate_wild_do_table                = mysql.%
#replicate_wild_ignore_table            = test.%
#auto_increment_offset                  = 1
#auto_increment_increment               = 2
#plugin_dir                             = ${DATA_DIR}/lib/plugin
#plugin_load                            = "rpl_semi_sync_master=semisync_master.so;rpl_semi_sync_slave=semisync_slave.so"
#rpl_semi_sync_master_enabled           = ON
#rpl_semi_sync_slave_enabled            = ON
#rpl_semi_sync_master_timeout           = 1000
slave_transaction_retries              = 128

## MTS
relay_log_recovery                     = 1
#slave_parallel_type                    = LOGICAL_CLOCK
#slave_parallel_workers                 = 16
#slave_preserve_commit_order            = 1

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

### 创建软链接

my.cnf文件客户端和服务端都需要使用的。

```bash
sudo ln -s ${BASE_DIR}/etc/my.cnf /etc/my.cnf
```

### 创建service文件

```bash
sudo cp ${BASE_DIR}/share/mysql.service /etc/init.d/
sudo systemctl daemon-reload
```

## 初始化数据库

```bash
${BASE_DIR}/bin/mysqld --initialize-insecure      # 空密码, 可以通过mysql命令登录
${BASE_DIR}/bin/mysqld --initialize               # 随机密码，看error_log
```

## 优化工作

### 添加环境变量

```bash
echo "export PATH=\$PATH:${BASE_DIR}/bin" >> /etc/profile
```

### 修改root密码

```sql
alter user 'root'@'localhost' IDENTIFIED BY 'password';
```



### 查看编译参数

```bash
cat /user/local/mysql/bin/mysqlbug |grep configure
```

