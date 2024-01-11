---
title: 在Windows下以服务方式运行MySQL
categories:
  - Windows
tags:
  - mysqld
  - 服务
  - 配置记录
abbrlink: c1f1096a
date: 2023-07-24 22:41:51
---

## 下载

本文安装的是zip包, 安装方式更灵活

下载地址: <https://dev.mysql.com/downloads/mysql/>

![下载页面](https://static.zahui.fan/images/202307242242296.png)

## 创建配置文件

在mysql根目录下创建`my.ini`文件,输入以下内容(根据自己需求调整, 如果不知道参数是做什么的, 那就不要配置, 不要瞎"调优"):

```ini
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8mb4

[mysqld]
#设置3306端口
port = 13306
# 设置mysql的安装目录, 这里也可以用相对路径表示, 如 . 表示当前目录
basedir=C:\Users\iuxt\OneDrive\1\mysqld
# 设置mysql数据库的数据的存放目录, 也可以用相对路径, 如 data
datadir=C:\Users\iuxt\OneDrive\1\mysqld\data
# 允许最大连接数
max_connections=200
# 设置服务端使用的字符集
character-set-server=utf8mb4
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
# 设置redolog日志文件大小
innodb_log_file_size=256M
# 关闭binlog
disable-log-bin
```


## 初始化数据库

没有data目录的话, 需要先初始化才能继续其他操作.

```bat
.\bin\mysqld.exe --initialize
```

然后在data目录下, 有个 `<计算机名>.err` 文件, 这个文件里面就包含了临时密码.

```bat
.\bin\mysql.exe -h127.0.0.1 -uroot -p
```

输入刚才看到的临时密码, 登录成功后执行以下命令修改默认root密码, 创建远程root用户

```sql
alter user 'root'@'localhost' IDENTIFIED BY '123456';
CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
Grant all privileges on *.* to 'root'@'%' with grant option;
```



## 直接启动(不推荐)

```bat
.\bin\mysqld.exe
```

## 通过服务启动

通过服务起的的话, `my.ini` 配置文件里面就不能写相对路径了.

### 安装服务

```bat
mysqld.exe install mysqld
```

### 启动服务

```bat
net start mysqld
```

### 停止服务

```bat
net stop mysqld
```

### 删除服务

```bat
sc delete mysqld
```

