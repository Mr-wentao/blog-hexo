---
title: Nginx使用module_vts模块来做监控
abbrlink: c6a32841
categories:
  - 基础运维
tags:
  - Nginx
  - Monitor
date: 2022-02-25 19:48:43
---

最近我们想要用Prometheus来监控Nginx的状态，所以看了一下有个module可以支持。项目地址在：<https://github.com/vozlt/nginx-module-vts.git>

## 重新编译Nginx

首先执行nginx -V 查看编译参数，记录一下, 比如

```bash
--prefix=/usr/local/nginx --user=www --group=www --with-stream --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-http_ssl_module --with-http_gzip_static_module --with-http_realip_module --with-http_flv_module --with-http_mp4_module --with-openssl=../openssl-1.1.1k --with-pcre=../pcre-8.45 --with-pcre-jit --with-ld-opt=-ljemalloc
```

然后需要Nginx源码包和当前安装的Nginx版本相同

下载nginx_module_vts

```bash
git clone git://github.com/vozlt/nginx-module-vts.git
```

进入nginx源码目录

```bash
cd nginx-1.20.2
```

开始编译，编译时增加一条参数

```bash
--add-module=../nginx-module-vts
```

结合上面记录的编译参数，完整的编译参数是：

```bash
./configure --prefix=/usr/local/nginx --user=www --group=www --with-stream --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-http_ssl_module --with-http_gzip_static_module --with-http_realip_module --with-http_flv_module --with-http_mp4_module --with-openssl=../openssl-1.1.1k --with-pcre=../pcre-8.45 --with-pcre-jit --with-ld-opt=-ljemalloc --add-module=../nginx-module-vts
```

开始编译

```bash
make
```

然后将编译好的二进制文件替换现有的nginx

```bash
cp /data/server/nginx-1.20.2/objs/nginx /usr/local/nginx/sbin/nginx
```

注：nginx-module-vts 模块从0.1.17+版本之后原生支持 prometheus 数据格式，可跳过 nginx-vts-exporter 的安装。

> 之前没安装过nginx的可以直接`make && make install`

## 开启监控

```conf
# 在 http 和 server 块中加入如下信息
http {
    vhost_traffic_status_zone;
    ...
    server {
        ...
        location /metrics {
            vhost_traffic_status_display;
            vhost_traffic_status_display_format prometheus;
        }
    }
}
```

监控接口为：

```bash
支持的输出格式有json html和 Prometheus

localhost/metrics
localhost/metrics/format/json
localhost/metrics/format/prometheus
```
