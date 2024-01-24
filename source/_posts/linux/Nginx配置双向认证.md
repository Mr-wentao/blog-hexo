---
title: Nginx配置双向认证
abbrlink: b78a00fa
categories:
  - linux
tags:
  - 配置记录
  - SSL
  - Nginx
  - 反向代理
  - Auth
date: 2022-05-28 14:40:02
---

单项认证只需要服务器提供证书即可, 不验证客户端证书, 而双向认证需要验证服务器证书,也需要验证客户端证书, 不满足要求的客户端可以不允许其访问, 并且可以通过后期吊销证书的方式禁止其访问.

证书签名可以参考:

[使用certbot自动申请ssl证书](/posts/28c679c3)

[使用acme.sh来自动更新https证书](/posts/1e777b9e)

[制作和使用自签名证书](/posts/097e5b7c)

本文提到的 `client.crt` `server.crt` 都是通过ca签发的

## 服务器配置

Nginx配置:

```conf
server {
        listen 443 ssl;
        server_name localhost;
        ssl_certificate ssl/server.crt;             # 配置证书位置
        ssl_certificate_key ssl/server.key;         # 配置私钥位置
        ssl_client_certificate ssl/ca.crt;          # 客户端证书
        ssl_verify_client on;                       # 打开客户端ssl验证
        ssl_session_timeout 5m;
        ssl_protocols SSLv2 SSLv3 TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
        ssl_prefer_server_ciphers on;
        root html;
        index index.html;
        location / {
                try_files $uri $uri/ =404;
        }
}
```

## 代理配置

比如服务器是开启了双向认证的, 我想用一台Nginx做代理, 证书都绑定到这台代理机器上面, 平常访问就访问这台代理Nginx就行了, 客户端不用再配置证书了.

Nginx配置:

```conf
server {
    listen       0.0.0.0:9999;
    access_log  off;
    location / {
        proxy_ssl_certificate        client.crt;
        proxy_ssl_certificate_key    client.key;
        proxy_ssl_server_name on;
        proxy_pass   https://10.0.0.134;
    }
}
```

如果你遇到访问nginx报错502的，恰好你的系统又是RedHat系， 可以尝试关闭Selinux

## 使用curl测试

```bash
curl --cacert ca.crt --cert client.crt --key client.key --tlsv1.2 https://10.0.0.134
```
