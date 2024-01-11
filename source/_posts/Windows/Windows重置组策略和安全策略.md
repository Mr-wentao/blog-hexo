---
title: Windows重置组策略和安全策略
abbrlink: 11456cf7
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - 组策略
date: 2022-10-10 21:55:44
---

还原本地安全策略

```bat
secedit /configure /cfg %windir%\inf\defltbase.inf /db defltbase.sdb /verbose
```

使用命令行重置组策略对象

```bat
RD /S /Q "%WinDir%\System32\GroupPolicyUsers"
RD /S /Q "%WinDir%\System32\GroupPolicy"
gpupdate /force
```
