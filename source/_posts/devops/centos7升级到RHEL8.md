---
title: Centos7升级到RHEL8
abbrlink: 6d586ed1
categories:
  - devops
tags:
  - Linux
  - CentOS
date: 2021-08-04 21:39:02
---

本文依照redhat官方文档制作，总共分为两步，先将centos7转换为rhel7，然后再将rhel7升级为rhel8

> 参考文档：  
[cenots7转换为rhel7](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html-single/converting_from_an_rpm-based_linux_distribution_to_rhel/index)  
[rhel7升级为rhel8](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/8/html/upgrading_from_rhel_6_to_rhel_8/preparing-the-rhel-7-system-for-an-upgrade-to-rhel-8_upgrading-from-rhel-6-to-rhel-8)

## centos7升级为rhel7

### 升级到centos7最新版

```bash
yum update -y && reboot
```

### 安装convert2rhel

```bash
curl -o /etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release https://www.redhat.com/security/data/fd431d51.txt


curl -o /etc/yum.repos.d/convert2rhel.repo https://ftp.redhat.com/redhat/convert2rhel/7/convert2rhel.repo


yum install -y convert2rhel
```

### 开始转换

```bash
convert2rhel --username <替换为你的用户名> --password <替换为你的密码>
不加--pool 会提示手动选择，为了安全也可以不加参数直接运行convert2rhel
```

## rhel7 升级 rhel8

### 启用这两个仓库

```bash
subscription-manager repos --enable rhel-7-server-rpms && \
subscription-manager repos --enable rhel-7-server-extras-rpms
```

### 取消版本锁定？

```bash
subscription-manager release --unset
yum versionlock clear
```

### 确保locale是en_US

```bash
cat /etc/locale.conf
LANG="en_US.UTF-8"
```

### 安装leapp

```bash
yum update && reboot
yum install leapp leapp-repository
```

### Leapp实用程序所需的数据

> 数据来自于<https://access.redhat.com/articles/3664871>

```bash
tar -xzf leapp-data14.tar.gz -C /etc/leapp/files && rm leapp-data14.tar.gz
```

### 准备升级，检查问题

```bash
leapp preupgrade
```

### 创建应答文件，做出响应

```bash
leapp answer --section remove_pam_pkcs11_module_check.confirm=True
```

或者修改`/var/log/leapp/answerfile`

### 开始升级，在终端来升级，不要远程连接

```bash
leapp upgrade
```

### 升级完成清理仓库

```bash
yum remove epel-release puppet5-release ...
/etc/yum.repos.d/
```

### 打开selinux

```bash
vim /etc/selinux/config
```

### 升级完检查

```bash
subscription-manager list --installed
uname -r
subscription-manager release
cat /etc/redhat-release
```
