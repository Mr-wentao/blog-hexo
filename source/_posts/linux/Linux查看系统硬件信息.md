---
title: Linux查看系统硬件信息
abbrlink: 6a0f629b
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - linux
tags:
  - Linux
  - 硬件信息
date: 2022-09-03 20:15:24
---

## CPU

查看cpu型号

```bash
cat /proc/cpuinfo |grep "model name"
```

查看CPU核心数

```bash
cat /proc/cpuinfo |grep "cpu cores"
```

查看cpu支不支持aes(结果有aes即为支持)

```bash
grep -m1 -o aes /proc/cpuinfo
```

## 内存

查看内存大小

```bash
cat /proc/meminfo |grep MemTotal
```

查看内存型号，插槽

```bash
dmidecode -t memory | grep "Size:"
```

## 硬盘

查看硬盘

```bash
fdisk -l |grep Disk
```

查看挂载、分区

```bash
sudo lsblk
```

查看软raid状态

```bash
cat /proc/mdstat
```



## PCI设备

查看pci设备

```bash
lspci -tv
```

## 网卡

查看网卡crc校验错误数：

```bash
ethtool -S ens1f1 | grep rx_crc_errors:
```

如果数量一致增大，就是有问题

dmesg 可以查看网卡down 和up的情况
