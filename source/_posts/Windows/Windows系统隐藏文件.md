---
title: Windows系统隐藏文件
abbrlink: adfa6bbb
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - bat
date: 2021-04-04 11:29:33
---

## attrib 命令

> 这个只是隐藏, 并没有把文件加密

```bat
attrib +S +H <文件或文件夹>
```

- 优点: 不用加密解密, 访问简单
- 缺点: 不安全

## 创建vhd并使用bitlocker

在磁盘管理里面创建vhd磁盘, 挂在好后使用BitLocker加密(可选)

- 优点: 数据安全,没有密码无法解密
- 缺点: 容易损坏,造成数据**全部丢失**

## 使用第三方加密软件

略

## 使用压缩软件加密

略

