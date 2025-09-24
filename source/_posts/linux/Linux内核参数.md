---
title: Linux内核参数
abbrlink: 1b957a56
cover: 'https://s3.babudiu.com/iuxt//images/202211041307268.jpg'
categories:
  - linux
tags:
  - Linux
  - Kernel
date: 2022-09-06 16:39:41
---





## 修改内核参数

### 临时修改

#### 修改/proc目录

```bash
echo 2048 > /proc/sys/net/core/somaxconn
```

> /proc/sys/ 目录是 Linux 内核启动后生成的伪目录，其目录下的net文件夹中存放了当前系统中生效的所有内核参数、目录树结构与参数的完整名称相关，如 `net.ipv4.tcp_tw_recycle`，它对应的文件是 /proc/sys/net/ipv4/tcp_tw_recycle，文件的内容就是参数值。



#### sysctl命令修改

```bash
sysctl -w net.ipv4.tcp_tw_recycle="0"
```



### 永久修改

```bash
vim /etc/sysctl.conf
net.core.somaxconn = 2048
sysctl -p
```





## 查看内核参数

### 查看/proc/目录

```bash
cat /proc/sys/net/ipv4/tcp_tw_recycle
```



### sysctl查看

```bash
sysctl -a                            # 查看所有
sysctl -n net.ipv4.ip_forward        # 查看单个
```



## 常用内核参数

```bash
vm.overcommit_memory = 1
net.ipv4.ip_forward = 1                    #允许ip转发
net.ipv4.icmp_echo_ignore_all=1            # 不允许ping
```

