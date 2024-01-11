---
title: alpine常用配置
abbrlink: c43764dd
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - 配置记录
  - Alpine
date: 2021-04-27 23:03:34
---

安装telnet命令

```bash
apk add busybox-extras busybox
```

清华源

```bash
sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
```

安装常用工具

```bash
apk add vim python3 git
```

alpine 默认的是ash shell

```bash
vim ~/.profile
```

## alpine服务管理工具

```bash
查看所有服务
rc-service --list

添加开机自启动
rc-update add {service-name}
```

## 网络配置

```bash
dns
/etc/resolv.conf


网卡配置文件/etc/network/interface
iface eth0 inet static
    address 192.168.1.150
    netmask 255.255.255.0
    gateway 192.168.1.1


或者iface eth0 inet dhcp
```
