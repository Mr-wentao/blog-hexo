---
title: Windows映射网络驱动器
abbrlink: 88695286
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - Windows
date: 2021-04-30 09:19:46
---

## net use 命令常用操作

```bat
:: 取消所有连接
net use * /del /y

:: 映射坚果云webdav, PERSISTENT:no表示不会记忆映射, 重启会丢失.
net use Z: https://dav.jianguoyun.com/dav/ /user:iuxt@qq.com <你的应用密码> /PERSISTENT:no
```

## subst命令

```bat
:: 映射C:\Files到D: 某些软件不支持
subst D: C:\Files
```
