---
title: Linux虚拟内存swap
abbrlink: '25938561'
cover: 'https://s3.babudiu.com/iuxt//images/202211041307268.jpg'
categories:
  - linux
tags:
  - Linux
date: 2021-05-27 20:52:22
---

## 增加swap(文件)

### 创建swap

生成一个空文件（2048M）

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
```

标记成swap文件

```bash
sudo mkswap /swapfile
```

### 手动挂载swap

```bash
挂载： 
sudo swapon /swapfile

卸载： 
sudo swapoff /swapfile
```

### 开机自动挂载

`vim /etc/fstab`添加一行

```bash
/swapfile   swap  swap  defaults  0  0
```

## 删除swap(文件)

### 查看swap文件地址

```bash
swapon
```

### 手动关闭swap

```bash
sudo swapoff /swapfile
```

### 删除swap文件

```bash
sudo rm -f /swapfile
```

### 取消开机自动挂载

`vim /etc/fstab`, 删除包含`swapfile`的一行
