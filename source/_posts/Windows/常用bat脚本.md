---
title: 常用bat脚本
abbrlink: 54c97110
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - Windows
tags:
  - bat
  - Script
date: 2021-02-26 15:24:30
---

这篇文章说的都是经常用到的bat脚本编写小技巧，比如获取管理员权限、注册表操作、进程操作、服务操作等

## 自动输入y

```bat
echo y|reg delete "HKEY_CLASSES_ROOT\Local Settings\Software\Microsoft\Windows\CurrentVersion\TrayNotify" /v IconStreams
```

## bat脚本获取管理员权限

在bat脚本最上面添加一行

```bat
@echo off
%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit
cd /d "%~dp0"
```

## 输出控制台不换行

```bat
echo|set /p="Test"
```

## 服务操作

> windows服务操作命令有sc和net 两个命令;

```bat
sc stop serviceName
sc start serviceName
sc config AcronisActiveProtectionService start= disabled
sc create npc start=auto binPath="C:\1\npc\npc.exe -server=note.iuxt.top:10000 -vkey=ibtbrp5e3uc9lonq -type=tcp" DisplayName="npc内网穿透服务"

net stop serviceName
net start serviceName
```

> 虽然2个都能达到停止服务和启动服务的效果，但是在重启服务时，就是使用批处理先stop后start来实现重启时，如果服务处于启动状态使用sc的stop后start，结果服务不能启动，因为sc命令在执行stop后不会等待，而是继续执行批处理下面的语句，这时服务正在处于停止操作状态，所以start命令不能启动。net命令在stop时会停止等待，在服务完全停止后再继续执行批处理后面的语句，所以net的重启命令就会正常。

## 进程操作

```bat
taskkill /f /im Xshell*
```

## 删除注册表

```bat
reg delete "HKCU\Software\Microsoft\NetLicense" /f

reg add "HKLM\SOFTWARE\Classes\.xdts" /f /ve /d "Xmanager.session" >NUL 2>NUL
```

## 删除目录

```bat
rd/s/q "%ProgramData%\FLEXnet" 2>NUL
rmdir/s/q "%CommonProgramFiles%\Macrovision Shared"2>NUL
```

> rd就是rmdir

## 判断有没有目录

```bat
if not exist "%ProgramData%\NetSarang Computer" md "%ProgramData%\NetSarang Computer"
```

## 复制文件

```bat
echo f|xcopy /e/i/c/y "Data\NetSarang Computer" "%ProgramData%\NetSarang Computer"
```

## 带空格路径的处理

> 用""引起来，不方便用""的可以用下面的短名称，或者用变量的形式表示

```bat
start C:\Progra~1\Notepad++\notepad++.exe C:\Windows\System32\drivers\etc\hosts
```

## 将字符串复制到剪切板

```bat
echo|set /p="Test" | clip
```

## 设置环境变量

```bat
:: /M 增加系统环境变量
setx /M MySQL_HOME "C:\mysql"
```