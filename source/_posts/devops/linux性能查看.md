---
title: Linux性能分析
abbrlink: 8ea6978b
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - Command
date: 2021-05-28 15:05:51
---

## vmstat

> 间隔1s, 一共5次

```bash
vmstat 1 5
```

每一列的说明

```sh
Procs（进程）:
- r: 运行队列中进程数量
- b: 等待IO的进程数量

Memory（内存）:
- swpd: 使用虚拟内存大小
- free: 可用内存大小
- buff: 用作缓冲的内存大小
- cache: 用作缓存的内存大小

Swap:
- si: 每秒从交换区写到内存的大小
- so: 每秒写入交换区的内存大小
- IO：（现在的Linux版本块的大小为1024bytes）
- bi: 每秒读取的块数
- bo: 每秒写入的块数

system：
- in: 每秒中断数，包括时钟中断
- cs: 每秒上下文切换数

CPU（以百分比表示）
- us: 用户进程执行时间(user time)
- sy: 系统进程执行时间(system time)
- id: 空闲时间(包括IO等待时间)
- wa: 等待IO时间
```

## sar

### 安装

```bash
yum  install sysstat
```

### 查看物理网卡占用

```bash
sar -n DEV 1 5
```

> sar -n 选项使用6个不同的开关：DEV，EDEV，NFS，NFSD，SOCK，IP，EIP，ICMP，EICMP，TCP，ETCP，UDP，SOCK6，IP6，EIP6，ICMP6，EICMP6和UDP6 ，DEV显示网络接口信息，EDEV显示关于网络错误的统计数据，NFS统计活动的NFS客户端的信息，NFSD统计NFS服务器的信息，SOCK显示套接字信息，ALL显示所有5个开关。它们可以单独或者一起使用。
> 1表示1秒一次, 5表示一共5次

### 查看swap

```bash
sar -W 1 5
```
