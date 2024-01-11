---
title: 制作绿色版Chrome浏览器
abbrlink: 8d9e31b7
categories:
  - Windows
tags:
  - 浏览器
  - 绿色软件
cover: 'https://static.zahui.fan/images/202212202109847.svg'
date: 2022-10-10 21:50:55
---

绿色版程序只需要将安装后的文件夹拷贝一份即可实现绿色化，不过浏览器生成的数据包括缓存、书签、历史记录等都是存储在操作系统默认位置的，完全随身携带，还需要将数据目录固定在程序文件夹下。

在chrome安装目录创建一个bat脚本

```bat
start chrome.exe --user-data-dir="User Data"
```

以后使用这个bat脚本来启动浏览器，数据文件就全部存放在当前目录下的User Data目录下
