---
title: Windows关机状态修改注册表内容
abbrlink: 36ac7ecc
categories:
  - Windows
tags:
  - 注册表
date: 2022-10-10 21:40:12
---

注册表是windows平台一种特殊的数据库，主要用于存储软件和系统的配置信息

正常情况下修改是打开注册表编辑器进行修改，不过有些特殊情况，比如系统启动就蓝屏，需要修改磁盘驱动器相关的配置，或者封装系统镜像修改默认设置，比如壁纸、计算机名等

注册表类似于数据库，它也是以文件的形式存储在电脑里面

修改方法：

进入PE，打开注册表编辑器，定位到**HKEY_LOCAL_MACHINE**然后点击 文件 - 加载配置单元 ，选择注册表Hive文件

首先列出Hive文件的位置

| Hive文件                            | 注册表位置                                     |
| ----------------------------------- | ---------------------------------------------- |
| C:\Windows\System32\config\SOFTWARE | HKEY_LOCAL_MACHINE\SOFTWARE                    |
| C:\Windows\System32\config\SYSTEM   | HKEY_LOCAL_MACHINE\SYSTEM                      |
| C:\Users/Default/NTUSER.DAT         | 默认用户配置(新建用户时会复制一份到用户文件夹) |
| C:\Users/用户名/NTUSER.DAT          | HKEY_CURRENT_USER                              |

修改完成，点击 文件 - 卸载配置单元 即可完成修改
