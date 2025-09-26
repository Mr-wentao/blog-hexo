---
title: SNAT服务器搭建
categories:
  - linux
tags:
  - snat
  - Linux
abbrlink: a222390c
date: 2025-09-28 11:35:19
---


## 查看是否开启路由转发

cat /proc/sys/net/ipv4/ip_forward
回显结果：1为开启，0为关闭，默认为0。
结果为1 跳过以下步骤，结果0 执行以下步骤
vi /etc/sysctl.conf
## 开启IP转发功能。
net.ipv4.ip_forward = 1
配置生效
sysctl -p /etc/sysctl.conf
# 如果有使用firewalld 则卸载，否则跳过
systemctl remove firewalld -y
yum install iptables-services -y
## 配置snat规则
```bash
iptables -t nat -A POSTROUTING -o eth0 -s (soure IP) -j SNAT --to (snat服务器IP)
```
## 保存snat规则
```bash
service iptables save
```
## 查看snat规则
```bash
iptables -t nat --list
```
## 添加开机启动
```bash
vi /etc/rc.local
iptables -t nat -A POSTROUTING -o eth0 -s (soure IP) -j SNAT --to (snat服务器IP)
```
