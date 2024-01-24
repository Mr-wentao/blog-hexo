---
title: Debian常用配置
categories:
  - devops
tags:
  - 配置记录
abbrlink: 8c4ff9d2
cover: 'https://static.zahui.fan/images/202305102217304.png'
date: 2023-04-17 18:08:56
---
这里以Debian12为例

## 修改国内源

```bash
# 修改默认镜像源
sudo sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list

# 修改security镜像源
sudo sed -i 's|security.debian.org/debian-security|mirrors.ustc.edu.cn/debian-security|g' /etc/apt/sources.list
```

## 配置网络

vim /etc/network/interfaces

### 固定ip配置

```conf
auto enp0s3
iface enp0s3 inet static
    address 192.168.1.240/24
    network 192.168.1.0
    broadcast 192.168.1.255
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8
# 其中 network\broadcast 可以省略不写
```

### DHCP配置

```bash
iface enp0s3 inet dhcp
```

### 重启网络服务

```bash
sudo systemctl restart networking.service
```
