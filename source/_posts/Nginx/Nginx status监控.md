---
title: Nginx Status监控
abbrlink: 7d58920d
categories:
  - Nginx
tags:
  - Nginx
  - Monitor
date: 2022-10-04 21:38:16
---

```conf
server {
        listen 8080;
        access_log off;

        location /nginx_status {
            stub_status on;
        }
```

这个时候请求,返回

```bash
curl localhost:8080/nginx_status

Active connections: 1 
server accepts handled requests
 7 7 6 
Reading: 0 Writing: 1 Waiting: 0

```