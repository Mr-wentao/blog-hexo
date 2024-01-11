---
title: 在Windows下实现一个快速转换音乐格式的小工具
categories:
  - Windows
tags:
  - cli
  - bat
  - cmd
  - 命令行工具
abbrlink: lmm46hng
date: 2023-09-16 22:18:54
---
搞点歌在车里听，但是早年10w的合资车只能听mp3格式，所以把需要我珍藏的音乐转换成mp3拷进U盘， 转换格式工具当然是选择ffmpeg了。搜了下命令是：
```bat
ffmpeg -i xxx.flac -acodec libmp3lame xxx.mp3
```

接下来需要做一个稍微自动化一点的工具，比如把flac文件拖放到bat脚本上，就能实现自动转换格式。

完整脚本如下：

```bat
chcp 65001
ffmpeg -i "%~s1" -acodec libmp3lame "%~dp0%~n1.mp3"
```

其中 chcp 65001 是为了防止bat脚本中包含中文导致的乱码。申明脚本编码为UTF-8， 脚本保存的时候也要以UTF-8编码保存， 如果不加 `chcp 65001`, 那么需要使用windows记事本打开重新保存编码选择`ANSI`， 因为cmd默认的编码就是GBK
![image.png](https://static.zahui.fan/images/202309162228582.png)

以下是一些常用的代码页。

| 代码页 | 说明            |
| ------ | --------------- |
| 65001  | UTF-8代码页     |
| 950    | 繁体中文        |
| 936    | 简体中文默认GBK |
| 437    | MS-DOS美国英语                |


另外脚本里用到的变量说明：

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
echo 文件大小： %~z1@echo off
echo 当前的bat文件："%~0"
echo 当前盘符："%~d0"
echo 当前盘符和路径："%~dp0"
echo 当前批处理全路径："%~f0"
echo 当前盘符和路径的短文件名格式："%~sdp0"
echo 当前CMD默认目录："%cd%"
```

上面的脚本用到了短路径， 短路径的好处是可以解决路径中带有空格的问题。