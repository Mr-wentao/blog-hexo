---
title: 使用certbot自动申请ssl证书
abbrlink: 28c679c3
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - SSL
  - 配置记录
  - Crontab
date: 2021-09-26 21:42:12
---

> certbot可以自动申请let's encrypt https证书, 并且可以自动续期，另见：[使用acme.sh来自动更新https证书](/posts/1e777b9e)

## 申请证书前准备

### 添加DNS解析

域名为你需要申请https证书的域名，添加A记录到服务器IP

### 安装certbot和certbot nginx plugin

```bash
sudo apt install certbot
sudo apt install python3-certbot-nginx
```

## 申请证书

```bash
sudo certbot --non-interactive --redirect --agree-tos --nginx -d password.zahui.fan -m captain@zahui.fan
```

> 以上操作除了申请证书外，还可以自动添加https配置到nginx，很方便。

## 证书续期

```bash
sudo certbot renew
```

> 添加到root用户的crontab里面就可以实现自动续期，距离到期时间太长会自动跳过续期

## 删除证书

```bash
sudo certbot delete
```
