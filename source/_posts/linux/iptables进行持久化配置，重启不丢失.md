---
title: Iptables进行持久化配置，重启不丢失
abbrlink: d8f4121a
categories:
  - linux
tags:
  - iptables
  - 网络
date: 2022-07-19 17:59:35
---

操作文档针对ubuntu20和centos系统，其他系统类似。`iptables-save`命令其实只是把配置文件打印出来，并不会真的save，这个有点容易让人误解。

## 针对ubuntu平台

ubuntu20需要安装iptables-persistent才能实现持久化

```bash
apt install iptables-persistent
```

持久化的配置文件保存在

```bash
# 针对ipv4
/etc/iptables/rules.v4

# 针对ipv6
/etc/iptables/rules.v6
```

手动保存当前配置

```bash
# 针对ipv4
sudo iptables-save > /etc/iptables/rules.v4

# 针对ipv6
sudo ip6tables-save > /etc/iptables/rules.v6
```

## 针对centos平台

安装包 `iptables-services`

```bash
sudo dnf install iptables-services
```

配置文件位置

```bash
/etc/sysconfig/iptables
/etc/sysconfig/ip6tables
```

需要关闭firewalld然后启动iptables

```bash
sudo systemctl disable --now firewalld
sudo systemctl enable --now iptables
```

手动保存当前配置

```bash
sudo iptables-save > /etc/sysconfig/iptables
sudo ip6tables-save > /etc/sysconfig/ip6tables
```

## netfilter-persistent命令

使用`netfilter-persistent save`可以自动保存当前规则，本质上是调用两个脚本
