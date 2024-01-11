---
title: 使用openssl对文件进行加密
categories:
  - 基础运维
tags:
  - 加密
  - SSL
abbrlink: lqxdtb6m
cover: 'https://static.zahui.fan/images/202401042221107.png'
date: 2024-01-03 14:12:53
---

## 使用密码加密

```bash
# 指定输入和输出文件操作
openssl enc -e -aes256 -in test.sh -out enc.sh

# 或者使用管道符
cat test.sh | openssl enc -e -aes256 -out enc.sh

# 压缩后加密
tar zcvf - 1.sh | openssl enc -e -aes256 -out temp
```

## 使用密码解密

```bash
# 指定输入和输出文件操作
openssl enc -d -aes256 -in enc.sh -out 1.sh

# 或者使用管道符进行操作
openssl enc -d -aes256 -in enc.sh | tee a.sh

# 解密后进行解压
openssl enc -d -aes256 -in temp | tar zxvf -
```