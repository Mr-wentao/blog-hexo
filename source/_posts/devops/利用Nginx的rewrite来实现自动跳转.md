---
title: 利用Nginx的rewrite来实现自动跳转
categories:
  - 基础运维
tags:
  - Nginx
abbrlink: ldsv2ssw
date: 2023-02-06 21:41:08
---


## 任意链接都跳转到指定页面

> 需要部署一个服务在Kubernetes内， 需要实现通过ingress可以访问到， 本来是很简单的事情， 但是由于访问来源的location不确定，为了避免报错404，所以用Nginx的rewrite来实现

Nginx配置如下（所有location转发到index.html）：
```conf
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name _;
        root /var/www/html;

        index index.html index.htm index.nginx-debian.html;

        location / {
                rewrite ^(.*) /index.html break;
        }

}
```


## 自动跳转https

配置文件如下：
```conf
 if ( $scheme = http ){
      rewrite ^(/.*)$ https://$host$1 permanent;
  }
```


## 判断Header

```conf
if ($http_user_agent !~* "(Go-http-client/.*|.*Safari.*)") { 
    return 404;
}
```

## 直接返回内容

比如备案、或者各种认证， 证明网站属于自己，通常会给一个txt文件让放在网站根目录，其实可以使用这种方法来实现

```conf
location /098x6OP2Qq.txt {
    default_type text/plain;
    return 200 "389d33763da910dca2efcedafbafc433";
}
```

## 返回请求者IP

实现一个获取公网ip的小工具，类似于 `curl ip.sb` 可以直接在终端获得公网ip。

```conf
location /ip {
    default_type text/plain;
    return 200 $remote_addr\n;
}
```