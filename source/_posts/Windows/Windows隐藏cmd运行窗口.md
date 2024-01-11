---
title: Windows隐藏cmd运行窗口
abbrlink: 3b6d9935
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - Windows
tags:
  - bat
date: 2021-03-15 18:33:33
---

## 使用开源软件实现(推荐)

> hidecon.exe [官网地址](http://code.kliu.org/misc/)

使用方法，将hidecon.exe和其他可执行放在一块，在bat脚本前面加上

```bat
hidecon.exe
npc -server=xxx:8888 -vkey=xxxxxxxxxxxxxxxx -type=tcp
```

## 使用vbs实现（推荐）

```bat
CreateObject("WScript.Shell").Run "D:\syncthing\syncthing.exe",0
```

或者批量运行：

```bat
Set ws = CreateObject("Wscript.Shell")
ws.run "cmd /c start 1.exe",vbhide
ws.run "cmd /c start 2.exe",vbhide
ws.run "cmd /c start 3.exe",vbhide
```

复制保存成vbs文件即可。

## 使用cmd实现（会有一闪而过的黑窗）

```bat
@echo off
if "%1"=="h" goto begin
start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit
:begin
::以下为正常批处理命令，不可含有pause set/p等交互命令
```

复制保存为bat文件即可。
