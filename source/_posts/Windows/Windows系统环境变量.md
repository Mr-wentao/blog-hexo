---
title: Windows系统环境变量
abbrlink: 7468bc35
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - Windows
date: 2021-05-22 10:49:40
---

> 环境变量简单来说就是一个键值对，比较常见的是`path`环境变量，定义的是全局程序存放的位置

Windows 查看环境变量 使用 `echo %date%`

## 用户环境变量

注册表位置：`HKEY_CURRENT_USER\Environment` 用户环境变量只对当前用户起作用

## 系统环境变量

注册表位置：`HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Control\Session Manager\Environment`

### 常用系统自带变量

| 变量                      | 类似格式                                 |
| ------------------------- | ---------------------------------------- |
| %COMMONPROGRAMFILES%      | C:\Program Files\Common Files            |
| %COMMONPROGRAMFILES(x86)% | C:\Program Files (x86)\Common Files      |
| %PROGRAMFILES%            | C:\Program Files                         |
| %PROGRAMFILES(X86)%       | C:\Program Files (x86)                   |
| %COMSPEC%                 | C:\Windows\System32\cmd.exe              |
| %HOMEDRIVE%               | C:                                       |
| %HOMEPATH%                | C:\Users\iuxt                            |
| %SYSTEMROOT%              | C:\Windows                               |
| %WINDIR%                  | C:\Windows                               |
| %TMP%                     | C:\Users\iuxt\AppData\Local\Temp         |
| %TEMP%                    | C:\Users\iuxt\AppData\Local\Temp         |
| %CD%                      | 当前目录                                 |
| %DATE%                    | 当前日期                                 |
| %TIME%                    | 时间                                     |
| %APPDATA%                 | C:\Users\iuxt\AppData\Roaming            |
| %LOCALAPPDATA%            | C:\Users\iuxt\AppData\Local              |
| %SYSTEMDRIVE%             | C:                                       |
| %USERNAME%                | iuxt                                     |
| %USERPROFILE%             | C:\Users\iuxt                            |
| %ONEDRIVE%                | C:\Users\iuxt\OneDrive                   |
| %ERRORLEVEL%              | 上一个命令的错误码， 类似于linux里面的$? |
| %PROGRAMDATA%             | C:\ProgramData                           |
| %PUBLIC%                  | C:\Users\Public                          |
| %COMPUTERNAME%            | 计算机名                                 |
| %RANDOM%                  | 随机数（0-32767）                        |
