---
title: 使用PowerShell操作Windows Defender
categories:
  - Windows
tags:
  - Windows
  - PowerShell
  - Command
abbrlink: lqkgw2cy
date: 2022-12-25 13:18:00
---


首先需要使用到管理员权限运行PowerShell

## 查看排除列表
```powershell
$WDAVprefs = Get-MpPreference
$WDAVprefs.ExclusionPath
```

## 排除指定文件夹

```powershell
powershell.exe -Command 'Set-MpPreference -ExclusionPath "C:\xxx", "D:\yyy"'
Add-MpPreference -ExclusionPath "C:\Program Files (x86)\WinAgent\*"
```
