---
title: 编译安装Nginx记录
abbrlink: d90d2aa0
categories:
  - 基础运维
tags:
  - Nginx
  - build
  - 配置记录
date: 2022-04-14 12:54:55
---

通常来说编译不通过都是因为系统环境不满足条件，如缺少包等，本文以CentOS 7 系统为例，其中有些包如xxx-devel在ubuntu下一般都是叫做xxx-dev的，实在找不到可以使用apt-file查找文件属于哪个包。

需要准备好这些包（不用监控可以不用准备nginx-module-vts）:

```bash
wget https://nginx.org/download/nginx-1.22.0.tar.gz
wget https://github.com/iuxt/nginx-module-vts/archive/refs/tags/v0.1.18.tar.gz
wget https://ftp.openssl.org/source/openssl-1.1.1p.tar.gz
wget https://ftp.exim.org/pub/pcre/pcre-8.45.tar.gz
```

全部解压，然后进入`nginx-1.22.0`目录操作

## 首先运行一遍configure命令

```bash
./configure --prefix=/usr/local/nginx \
            --user=www --group=www \
            --with-stream \
            --with-http_stub_status_module \
            --with-http_sub_module \
            --with-http_v2_module \
            --with-http_ssl_module \
            --with-http_gzip_static_module \
            --with-http_realip_module \
            --with-http_flv_module \
            --with-http_mp4_module \
            --with-openssl=../openssl-1.1.1p \
            --with-pcre=../pcre-8.45 \
            --with-pcre-jit \
            --with-ld-opt=-ljemalloc \
            --add-module=../nginx-module-vts-0.1.18
```

> nginx-module-vts 是监控模块，如果不用监控，可以将这一行删除  
> user group prefix 这些参数只是个默认值，是可以被配置文件的配置覆盖的

### 常见报错解决

- `./configure: error: C compiler cc is not found`

    ```bash
    yum install -y gcc-c++
    ```

- `checking for --with-ld-opt="-ljemalloc" ... not found`

    ```bash
    # centos
    yum install -y epel-release
    yum install -y jemalloc-devel

    # ubuntu
    sudo apt install -y libjemalloc-dev
    ```

- `checking for zlib library ... not found`

    ```bash
    yum install zlib-devel
    ```

- `You need Perl 5.`

    ```bash
    yum install perl-devel
    ```

## 开始编译

{% tabs TabName %}

<!-- tab 单核心编译 -->


```bash
make
```

<!-- endtab -->

<!-- tab 多核心编译 -->

```bash
make -j 4
```

> 4 表示用4个核心来编译

<!-- endtab -->
{% endtabs %}

## 安装

### 创建用户组和用户

```bash
groupadd www
useradd -g www -M -s /sbin/nologin www
```

### 安装可执行文件

可以用`make install`来快速安装，也可以自己进入objs目录把nginx复制到其他地方，配置文件放在/usr/loca/nginx下

## 收尾工作

### 生成systemd文件

vim /usr/lib/systemd/system/nginx.service

```ini
[Unit]
Description=nginx - high performance web server
Documentation=http://nginx.org/en/docs/
After=network.target

[Service]
Type=forking
PIDFile=/usr/local/nginx/logs/nginx.pid
ExecStartPost=/bin/sleep 0.1
ExecStartPre=/usr/local/nginx/sbin/nginx -t -c /usr/local/nginx/conf/nginx.conf
ExecStart=/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
TimeoutStartSec=120
LimitNOFILE=1000000
LimitNPROC=1000000
LimitCORE=1000000

[Install]
WantedBy=multi-user.target
```

然后就可以愉快的使用Nginx了。

### 创建软链接

添加后就可以直接使用nginx命令了

```bash
sudo ln -s /usr/local/nginx/sbin/nginx /usr/bin/nginx
```

配置文件软链接

```bash
sudo ln -s /usr/local/nginx/conf/ /etc/nginx
```

## 其他

### 监控

监控的使用方法可以查看[Nginx使用module_vts模块来做监控](/posts/c6a32841)

### 查看编译参数

```bash
nginx -V
```
