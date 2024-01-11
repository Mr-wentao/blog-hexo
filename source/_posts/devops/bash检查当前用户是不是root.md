---
title: Bash检查当前用户是不是root
abbrlink: 78f9310c
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - 基础运维
tags:
  - bash
  - shell
date: 2022-10-04 21:49:49
---


```bash
if [ $(id -u) != "0" ]; then
    echo "Error: You must be root to run this script, please use root to install lnmp"
    exit 1
fi
```