---
title: Unix口令生成与使用
abbrlink: 6447a6a9
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - 基础运维
tags:
  - Linux
  - Auth
date: 2021-08-17 09:49:53
---

这个密码有什么用:
/etc/shadow linux用户密码就是通过这种方法hash的
http basic auth的密码也是通过这种方式生成的

## 通过openssl生成

执行

```bash
# ubuntu
openssl passwd -6 123456

参数的含义：
 -6                  SHA512-based password algorithm
 -5                  SHA256-based password algorithm
 -apr1               MD5-based password algorithm, Apache variant
 -1                  MD5-based password algorithm

# centos
openssl passwd -1 123456
```

> 就能生成一串字符串，其中参数6是最长的，1是最短的，后面123456是要加密的密码
> 仔细观察会发现每次生成的密码都是不同的，那是因为每次执行openssl会随机生成一个salt值，
> 可以有效防止字典反推，比如123456这种弱密码

手动指定salt值后，每次生成的密码都是一样的了

```bash
openssl passwd -salt zlk -6 123456
```

## 通过htpasswd生成

```bash
# Ubuntu or Debian
apt install apache2-utils

# Rhel or CentOS:
yum install httpd-tools
```

生成密码, 密码文件为`.htpasswd`

```bash
htpasswd -bcd .htpasswd username password
```

## 通过python生成

```bash
python -c 'import crypt; print(crypt.crypt("123456","salt"))'
```

> salt 是盐值，在密码学中，是指通过在密码任意固定位置插入特定的字符串，让散列后的结果和使用原始密码的散列结果不相符，这种过程称之为“加盐”。不同盐值生成的密码是不同的，能一定程度上防止反推出密码。
