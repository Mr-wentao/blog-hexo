---
title: Windows设置OEM信息
abbrlink: 6f85bc6b
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - 注册表
date: 2022-10-10 22:11:31
---


OEM信息存储于注册表中，修改注册表即可。

```bat
@echo off

%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit

cd /d "%~dp0"

reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OEMInformation" /f /v "SupportURL" /t REG_SZ /d "https://zahui.fan"
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OEMInformation" /f /v "Model" /t REG_SZ /d "PC"
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OEMInformation" /f /v "SupportHours" /t REG_SZ /d "8:00-22:00"
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OEMInformation" /f /v "SupportPhone" /t REG_SZ /d "17621268822"
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OEMInformation" /f /v "Logo" /t REG_SZ /d "C:\Windows\Media\logo.bmp"
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OEMInformation" /f /v "Manufacturer" /t REG_SZ /d "张理坤"
copy logo.bmp %windir%\media\logo.bmp
```

如果需要删除OEM信息
`reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OEMInformation" /f`
