---
title: 通过inode删除文件
abbrlink: 33d6f438
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - Command
date: 2021-09-01 14:11:02
---

> 有时候会有一些文件名是乱码的文件无法删除，这时候可以通过inode来删除。

## 获取文件的inode

```bash
ls -ali
```

第一列就是文件的inode

## 通过inode删除

```bash
find -inum 527084 -exec rm -rf {} \;
```
