---
title: centos常用配置
abbrlink: 6cc59126
categories:
  - linux
tags:
  - Linux
  - 配置记录
  - CentOS
  - Systemd
date: 2021-02-09 16:50:58
---

centos系统升级请看
[Centos7 升级 RHEL8](/posts/6d586ed1)

## 网络配置

```bash
vim /etc/sysconfig/network-scripts/ifcfg-ens**
```

### 固定ip配置

```conf
TYPE=Ethernet
BOOTPROTO=none
DEVICE=ens33
ONBOOT=yes
IPADDR=10.0.0.7
PREFIX=24
GATEWAY=10.0.0.2
DNS1=10.0.0.2
DNS2=223.5.5.5
DOMAIN=10.0.0.2
```

### DHCP配置

```conf
TYPE=Ethernet
BOOTPROTO=dhcp
PERSISTENT_DHCLIENT=yes
DEVICE=ens33
ONBOOT=yes
```

### 临时修改IP（重启失效）

```bash
ifconfig eth0 192.168.120.56
ifconfig eth0 192.168.120.56 netmask 255.255.255.0
ifconfig eth0 192.168.120.56 netmask 255.255.255.0 broadcast 192.168.120.255
```

### 临时增加vip

```bash
ip addr add 192.168.20.20/24 brd + dev eth0
```

### 网卡配置VLAN

```conf
TYPE=Vlan
VLAN=yes
VLAN_ID=180
BOOTPROTO=none
DEFROUTE=yes
NAME=enp3s0f0
DEVICE=enp3s0f0
ONBOOT=yes
IPADDR=192.168.20.230
PREFIX=24
GATEWAY=192.168.20.1
DNS1=114.114.114.114
```

### 修改网卡名

> centos7默认是以接口名称被自动基于固件，拓扑结构和位置信息来确定。如ens33,如果想要以eth0来命名

- 安装时配置

光标选择“Install CentOS 7”
点击Tab，打开kernel启动选项后，增加`net.ifnames=0 biosdevname=0`

## 系统配置

### 关闭 selinux

```bash
sed -i 's#SELINUX=enforcing#SELINUX=disabled#g' /etc/sysconfig/selinux && setenforce 0
```

### timedatectl命令

```bash
timedatectl list-timezones                    # 列出所有时区
timedatectl set-local-rtc 1                   # 将硬件时钟调整为与本地时钟一致, 0 为设置为 UTC 时间
timedatectl set-timezone Asia/Shanghai        # 设置系统时区为上海


timedatectl status                            # 查看状态

timedatectl set-ntp 0                         # 禁用ntp

# 只设置时间的话可以使用set-time开关以及HH：MM：SS（小时，分，秒）的时间格式。
timedatectl set-time 15:58:30

# 只设置日期的话可以使用set-time开关以及YY：MM：DD（年，月，日）的日期格式。
timedatectl set-time 20151120

# 设置日期和时间：
timedatectl set-time '16:10:40 2015-11-20'
```

### ntp时间同步

```bash
yum install ntp ntpdate -y 

systemctl start ntpdate

ntpdate time.windows.com
```

> ntp只会同步系统时间而不会同步硬件时间，若服务器重启则系统时间会失效，依旧从硬件时间开始计时，所以使用ntp同步系统时间后需要将系统时间同步到硬件时间 hwclock -w

### 修改内核参数

```bash
sysctl -w net.ipv4.ip_forward=1
```

### 忘记密码

重启, 在 `grub2` 界面 先按 `↑` 停在这个界面,然后按 `e` 进入编辑模式
找到 `linux16` 那一行, 在最后面添加 `init=/bin/sh`
按 `ctrl + x` 继续启动

```bash
mount -o remount,rw /
passwd root

touch /.autorelabel     # 使selinux生效，否则可能无法正常启动
exec /sbin/init         # 正常启动系统
```

### 修改时区

```bash

# 修改默认语言
sed -i 's@LANG=.*$@LANG="en_US.UTF-8"@g' /etc/locale.conf

# 通过环境变量设置时区
export TZ='Asia/Shanghai'

# 修改时区(修改环境变量后就没必要这样修改了)
rm -rf /etc/localtime
ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

### 安装相应字体

```bash
yum install dejavu-lgc-sans-fonts
```

### 全局代理

```bash
vim /etc/profile

export http_proxy="http://10.0.0.1:21882"
source /etc/profile
```

## 服务

```bash
systemctl list-units                    ##列出当前系统服务的状态
systemctl list-unit-files               ##列出服务的开机状态
systemctl status sshd                   ##查看指定服务的状态
systemctl stop sshd                     ##关闭指定服务
systemctl start sshd                    ##开启指定服务
systemctl restart sshd                  ##从新启动服务
systemctl enable sshd                   ##设定指定服务开机开启
systemctl disable sshd                  ##设定指定服务开机关闭
systemctl reload sshd                   ##使指定服务从新加载配置
systemctl list-dependencies sshd        ##查看指定服务的倚赖关系
systemctl mask  sshd                    ##冻结指定服务
systemctl unmask sshd                   ##启用服务
systemctl set-default multi-user.target ##开机不开启图形
systemctl set-default graphical.target  ##开机启动图形
setterm                                 ##文本界面设定color
```

### 查看所有的service

```bash
ll /usr/lib/systemd/system/
```

### 查看开机自启的service

```bash
systemctl list-unit-files | grep enabled
ll /etc/systemd/system/multi-user.target.wants/
```

### hostnamectl命令

```bash
hostnamectl set-hostname centos1
```

### 防火墙

```bash
systemctl start firewalld.service
systemctl stop firewalld.service
systemctl disable firewalld.service
```

## 基础环境

### 编译环境

```bash
yum groupinstall "Development Tools"
```

## yum 和 rpm

> yum 是用python写的

### 查看一个包有哪些文件组成

```bash
rpm -ql yum
```

### 查看所有包列表

```bash
rpm -qa
```

### 本地安装包,会自动处理依赖

```bash
yum localinstall ./xxx.rpm
```

### 本地安装包，不处理依赖

```bash
rpm -ivh ./xxx.rpm
```

### 阿里云源

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup

# CentOS 7
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
# 非阿里云ECS用户
sed -i -e '/mirrors.cloud.aliyuncs.com/d' -e '/mirrors.aliyuncs.com/d' /etc/yum.repos.d/CentOS-Base.repo

# epel(RHEL 7)
curl -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
```

### Remi源(各种版本的php)

```bash
yum install https://mirrors.aliyun.com/remi/enterprise/remi-release-7.rpm

yum install php74-php-fpm
```

### 查询一个文件属于哪个包

- 本机已经有这个文件，想知道在哪个包里面

```bash
rpm -qf  /file/path
```

- 缺少文件, 想知道在哪个包里面，方便安装

```bash
yum provides libm.so.6
```

### 只下载不安装

```bash
yum install --downloadonly --downloaddir=/tmp/ vsftpd
```

### 安装指定版本的包

查询包有那些可用的版本

```bash
yum list kubelet kubeadm kubectl  --showduplicates | sort -r
```

安装指定版本的包

```bash
yum install kubelet-1.16.9-0 kubeadm-1.16.9-0 kubectl-1.16.9-0
```
