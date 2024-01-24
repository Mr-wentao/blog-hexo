---
title: 检查域名支持的HTTPS协议版本
categories:
  - linux
tags:
  - 加密
  - SSL
abbrlink: lqxf8k8u
cover: 'https://static.zahui.fan/images/202401041718150.png'
date: 2024-01-03 14:52:44
---
## 在线验证

随便找了两个网站: 

<https://www.ssleye.com/ssltool/cipher_suites.html>

<https://www.site24x7.com/zhcn/tools/tls-checker.html>
## 使用CURL验证

```bash
curl --tlsv1 --tls-max 1.0  https://github.com
curl --tlsv1 --tls-max 1.0  https://www.baidu.com
```

报错说明不支持当前版本:

```
curl: (35) LibreSSL/3.3.6: error:1404B42E:SSL routines:ST_CONNECT:tlsv1 alert protocol version
```
## 使用OpenSSL

```bash
# 验证TLS1.2
openssl s_client -connect www.baidu.com:443 -tls1_2

# 验证TLS1.1
openssl s_client -connect www.baidu.com:443 -tls1_1

# 验证TLS1.0
openssl s_client -connect www.baidu.com:443 -tls1
```

如果握手失败的话，那么就是不支持了。

## 使用NMAP(推荐)

依赖于`nmap`, `nmap`需要安装
```bash
nmap --script ssl-enum-ciphers -p 443 baidu.com
```

比如GitHub只支持TLS1.2和TLS1.3：
![image.png](https://static.zahui.fan/images/202401031545944.png)


## 服务端TLS版本配置

可以通过配置服务端,比如nginx来设置支持的TLS版本.

配置生成地址: <https://ssl-config.mozilla.org/>

```conf
# generated 2024-01-03, Mozilla Guideline v5.7, nginx 1.17.7, OpenSSL 1.1.1k, intermediate configuration
# https://ssl-config.mozilla.org/#server=nginx&version=1.17.7&config=intermediate&openssl=1.1.1k&guideline=5.7
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    ssl_certificate /path/to/signed_cert_plus_intermediates;
    ssl_certificate_key /path/to/private_key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions
    ssl_session_tickets off;

    # curl https://ssl-config.mozilla.org/ffdhe2048.txt > /path/to/dhparam
    ssl_dhparam /path/to/dhparam;

    # intermediate configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;

    # HSTS (ngx_http_headers_module is required) (63072000 seconds)
    add_header Strict-Transport-Security "max-age=63072000" always;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # verify chain of trust of OCSP response using Root CA and Intermediate certs
    ssl_trusted_certificate /path/to/root_CA_cert_plus_intermediates;

    # replace with the IP address of your resolver
    resolver 127.0.0.1;
}
```