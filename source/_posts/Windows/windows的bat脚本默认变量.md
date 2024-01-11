---
title: Windows的bat脚本默认变量
abbrlink: 5157092d
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - Windows
tags:
  - cmd
  - bat
  - cli
date: 2022-10-04 21:53:29
---


```bat
chcp 65001
@echo off
echo 当前的bat文件："%~0"
echo 当前盘符："%~d0"
echo 当前盘符和路径："%~dp0"
echo 当前批处理全路径："%~f0"
echo 当前盘符和路径的短文件名格式："%~sdp0"
echo 当前CMD默认目录："%cd%"
```

桌面上的脚本输出输出类似于：

```txt
当前的bat文件："C:\Users\iuxt\Desktop\test.bat"
当前盘符："C:"
当前盘符和路径："C:\Users\iuxt\Desktop\"
当前批处理全路径："C:\Users\iuxt\Desktop\test.bat"
当前盘符和路径的短文件名格式："C:\Users\iuxt\Desktop\"
当前CMD默认目录："C:\Users\iuxt\Desktop"
```

以下是针对拖放文件：

脚本内容为：
```bat
chcp 65001
@echo off
echo 无后缀名： %~n1
echo 有后缀名： %~nx1
echo 绝对路径： %1
echo 短路径名的绝对路径： %~s1
echo 驱动器和路径： %~dp1
echo 驱动器： %~d1
echo 路径： %~p1
echo 文件属性： %~a1
echo 日期/时间： %~t1
echo 文件大小： %~z1
```

现在将另一个文件拖到这个脚本上：
```txt
无后缀名： 周传雄 - 男人海洋
有后缀名： 周传雄 - 男人海洋.mp3
绝对路径： "D:\周传雄 - 男人海洋.mp3"
短路径名的绝对路径： D:\___-~704.MP3
驱动器和路径： D:\
驱动器： D:
路径： \
文件属性： --a--------
日期/时间： 2023/04/09 22:34
文件大小： 9695866
```

| 变量 | 说明 |
| ---- | ---- |
|  %*    |  脚本的所有参数    |
