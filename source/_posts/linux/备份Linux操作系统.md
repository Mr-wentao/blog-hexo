---
title: 备份Linux操作系统
categories:
  - devops
tags:
  - 备份还原
  - Linux
abbrlink: a222390c
date: 2022-11-28 11:35:19
---

在Linux内, 一切皆文件, 所以可以通过直接复制文件的方式来备份Linux系统, 使用Linux自带的工具, 比如 tar rsync 都可以完成这些操作.

## 使用rsync备份还原Linux系统

### 使用rsync备份

比如备份路径是 `/backup` , 同时需要排除 `/backup`

```bash
rsync -aAXHv --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found", "/backup"} --delete / /backup
```

> 通过使用 -aAX 选项集，文件以归档模式传输，确保符号链接、设备、权限、所有权、修改时间、ACLs和扩展属性得以保留，前提是目标文件系统支持这一功能。选项 -H 保留了硬链接，但会使用更多的内存。
> swap文件也最好排除, gvfs需要排除 `/home/*/.gvfs`

### 使用rsync还原

在Linux Livecd下:

```bash
rsync -aAXHv --delete /backup /
```

rsync备份可以实现增量更新, 实时更新等, 比较方便使用, 速度也很快

## 使用dd命令

dd是直接进行硬盘对拷, 备份是将整个硬盘给dump下来, 速度非常慢, 不推荐这种方式

### 使用dd备份

```bash
dd if=/dev/sda of=/backup/backup.dd
```

### 使用dd还原

```bash
dd if=/backup/backup.dd of=/dev/sda
```

## 使用tar来实现

### 使用tar备份

```bash
cd /
tar -cvpzf backup.tar.gz \
--exclude=/backup.tar.gz \
--exclude=/proc \
--exclude=/tmp \
--exclude=/mnt \
--exclude=/dev \
--exclude=/sys \
--exclude=/run \ 
--exclude=/media \ 
--exclude=/var/log \
--exclude=/var/cache/apt/archives \
--exclude=/usr/src/linux-headers* \ 
--exclude=/home/*/.gvfs \
--exclude=/home/*/.cache \ 
--exclude=/home/*/.local/share/Trash /
```

### 使用tar还原

用livecd启动系统, 然后点击一下要还原的目的磁盘, 假设自动挂载到`/media/mountpath`

```bash
sudo tar -xvpzf /path/to/backup.tar.gz -C /media/mountpath --numeric-owner
sudo mkdir proc sys mnt media
```

> --numeric-owner恢复文件原来的权限

### 修复grub

```bash
sudo -s
for f in dev dev/pts proc ; do mount --bind /$f /media/whatever/$f ; done
chroot /media/mountpath
dpkg-reconfigure grub-pc
```
