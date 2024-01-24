---
title: CentOS7更新内核版本
categories:
  - devops
tags:
  - centos
abbrlink: 8a7e6530
date: 2022-12-23 11:05:24
---

## 确认当前内核版本

```bash
uname -r
```

## 安装内核仓库

> 仓库的官方地址是： <http://elrepo.org/tiki/HomePage>

```bash
rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
yum install https://www.elrepo.org/elrepo-release-7.el7.elrepo.noarch.rpm
```

## 查看可用的内核列表

```bash
yum --disablerepo="*" --enablerepo="elrepo-kernel" list available
```

## 安装LTS版内核

```bash
yum --enablerepo=elrepo-kernel install kernel-lt-devel kernel-lt kernel-lt-tools kernel-lt-tools-libs-devel -y
```

## 查看当前系统可用的内核

```bash
awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
```

## 修改默认内核

```bash
grub2-set-default 0
```

## 生成grub配置

```bash
grub2-mkconfig -o /boot/grub2/grub.cfg
```

## 重启系统

```bash
reboot
```

## 删除旧的内核(可选)

> {%label 删除内核有风险 red %}，干不干自行评估

### 查看当前安装的内核

```bash
rpm -qa | grep kernel
```

### 删除旧的内核

> 参考上一步输出的包名

```bash
yum remove kernel-3.10.0-327.el7.x86_64
```
