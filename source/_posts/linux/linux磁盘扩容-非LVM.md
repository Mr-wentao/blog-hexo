---
title: linux磁盘扩容(非LVM)
abbrlink: 33420276
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - linux
tags:
  - Linux
  - Disk
date: 2021-05-21 13:38:44
---

LVM是`Logical Volume Manager`的缩写，中文逻辑卷管理，LVM是建立在磁盘分区和文件系统之间的一个逻辑层，LVM会更加灵活，可以动态扩容缩容分区大小。调整分区大小有风险，请做好充分测试再决定是否执行。  
如果启用了`lvm`，请查看[LVM逻辑卷管理](/posts/f4ea28c3/)  
那么怎么知道机器有没有启用LVM呢，可以执行`sudo lvdisplay`查看有没有已存在的LV，`lsblk`查看现有的文件系统有没有`LVM`

> 网上查到的方法都是使用`fdisk`删除分区后再重新创建, 这种方式会有安全问题, 而`growpart`命令是安全的.

## 扩容器查看容量大小

```bash
[root@elk4 ~]# df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb1       985G  165G  770G  18% /data
```

> 如果你要扩容的路径对应的`Filesystem`不是`/dev/sdx`请不要看这篇文章

## 先增加硬盘容量

> 需要growpart命令, 没有请安装

{% tabs TabName %}
<!-- tab Ubuntu和Debian -->

```bash
sudo apt install cloud-guest-utils
```

<!-- endtab -->
<!-- tab CentOS和Fedora -->

```bash
sudo yum install cloud-utils-growpart
```

<!-- endtab -->
{% endtabs %}

## 执行growpart命令

```bash
[root@elk4 ~]# growpart /dev/vdb 1
CHANGED: partition=1 start=2048 old: size=2097149952 end=2097152000 new: size=3145725919 end=3145727967
```

## 最后调整文件系统大小

{% tabs 调整文件系统大小 %}

<!-- tab ext文件系统 -->

```bash
sudo resize2fs  /dev/sdb1
```

<!-- endtab -->

<!-- tab xfs文件系统 -->

```bash
sudo xfs_growfs /dev/sdb1
```

<!-- endtab -->

<!-- tab RHEL -->

在早期的RHEL中，由于resize2fs无在线resize功能，故额外提供了ext2online。

```bash
sudo ext2online /dev/sdb1
```

<!-- endtab -->
{% endtabs %}
