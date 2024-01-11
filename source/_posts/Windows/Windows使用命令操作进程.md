---
title: Windows使用命令操作进程
abbrlink: 222b586e
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - Windows
tags:
  - bat
date: 2021-03-15 18:33:33
---

## 查找进程

```bat
tasklist | findstr xxx
```

## 根据进程名杀进程

```bat
taskkill /F /IM npc.exe
```

## 根据进程PID杀进程

```bat
TASKKILL /PID 1230 /PID 1241 /PID 1253 /T
```
