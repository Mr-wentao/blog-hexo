---
title: Windows下使用bat脚本来新增环境变量
categories:
  - Windows
tags:
  - cmd
  - bat
abbrlink: lmsslh3g
date: 2023-09-21 14:29:01
---

自己创建了一个bin目录用于存放一些exe或者bat用于快速调用, 把它加到PATH环境变量中就可以在任意路径来调用了.

## 查看环境变量


```bat
set PATH
```

## 设置环境变量

```bat
setx PATH "%PATH%;%USERPROFILE%\bin"
```

这里需要注意把原有的`%PATH%`带上, 不然就会覆盖掉PATH变量, `%USERPROFILE%` 指的是个人文件夹, 我的就是`C:\Users\iuxt`

## 完整脚本

首先判断一下有没有环境变量, 没有的话就增加, 有的话什么都不做.

```bat
set path | findstr "%USERPROFILE%\bin" >nul && (
    echo 环境变量已存在
) || (
    echo 环境变量不存在
    setx PATH "%PATH%;%USERPROFILE%\bin"
)
```
