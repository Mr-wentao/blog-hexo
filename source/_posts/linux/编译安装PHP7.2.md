---
title: 编译安装PHP7.2
abbrlink: a03938f2
cover: 'https://static.zahui.fan/images/202211012253797.png'
categories:
  - linux
tags:
  - 编译
  - PHP
date: 2022-09-03 22:13:04
---



本文记录一下在Linux下编译安装PHP过程，没有特殊需求的话，使用yum源安装更方便。

## 准备工作

### 准备源码包

```bash
wget https://www.php.net/distributions/php-7.2.28.tar.bz2
mkdir -p /data/exec
```

### 创建用户

```bash
useradd www -s '/sbin/nologin'
```

### 安装编译依赖

```bash
apt install -y libxml2 libxml2-dev libcurl4-openssl-dev libfreetype6-dev libjpeg-dev libicu-dev libxslt1-dev openssl

yum install -y libxml2-devel libcurl-devel libjpeg libpng freetype libjpeg-devel libpng-devel freetype-devel libicu-devel libxslt-devel

# ldap扩展需要安装libldap-dev这个包
```



## 编译PHP7.2

```bash
./configure --prefix=/data/exec/php \
    --with-config-file-path=/data/exec/php/etc \
    --with-config-file-scan-dir=/data/exec/php/conf.d \
    --enable-fpm --with-fpm-user=www --with-fpm-group=www \
    --enable-mysqlnd --with-mysqli=mysqlnd --with-pdo-mysql=mysqlnd \
    --with-iconv-dir --with-freetype-dir --with-jpeg-dir --with-png-dir \
    --with-zlib --with-libxml-dir --enable-xml --disable-rpath \
    --enable-bcmath --enable-shmop --enable-sysvsem --enable-inline-optimization \
    --with-curl --enable-mbregex --enable-mbstring --enable-intl --enable-ftp --with-gd \
    --with-openssl --with-mhash --enable-pcntl --enable-sockets --with-xmlrpc --enable-zip \
    --enable-soap --with-gettext --enable-opcache --with-xsl

make && make install
```

## 测试PHP工作
```bash
echo "<?php phpinfo(); ?>" >> index.php
```



## 其他常用操作

### 查看编译参数

```bash
php -i |grep configure
```

### 查看当前生效的配置文件

```bash
php --ini
```

### 查看当前生效的扩展

```bash
php -m
```

