---
title: 使用Nginx反向代理域名
categories:
  - linux
tags:
  - nginx
  - Nginx
  - 反向代理
abbrlink: bad354d3
date: 2023-04-18 19:25:53
---

需求如下：研发代码里写死了地址 https://api.chehezhi.cn  现在在不想发布新代码的情况下修改地址为 https://api-st.chehezhi.cn

## 手动增加反向代理的header

先 `ping api-st.chehezhi.cn` 获取到服务器的ip

所以临时在pod里面新增了nginx 服务，配置如下，由于是代理https服务，还需要配置ssl证书，刚好有证书。。。

```conf
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;
  ssl_certificate   /etc/nginx/ssl.crt;
  ssl_certificate_key /etc/nginx/ssl.key;
  ssl_session_timeout 5m;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;
  server_name api.chehezhi.cn;
  client_max_body_size 1024m;


  location / {
    proxy_pass https://139.224.186.170;                        # ping 出来的域名IP
    proxy_set_header HOST api-st.chehezhi.cn;                  # 增加header HOST: api-st.chehezhi.cn
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## 优化写法

nginx提供了内置变量$proxy_host，优化写法为：

```conf
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;
  ssl_certificate   /etc/nginx/ssl.crt;
  ssl_certificate_key /etc/nginx/ssl.key;
  ssl_session_timeout 5m;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;
  server_name api.chehezhi.cn;
  client_max_body_size 1024m;

  location / {
    proxy_pass https://api-st.chehezhi.cn;
    proxy_set_header HOST $proxy_host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## 本地绑定hosts

```txt
127.0.0.1   api.chehezhi.cn
```

## 测试效果

这个时候两个域名访问效果一模一样了.

![访问效果](https://s3.babudiu.com/iuxt//images/202304181941595.png)