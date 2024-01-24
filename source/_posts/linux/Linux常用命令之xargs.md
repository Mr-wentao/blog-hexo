---
title: Linux常用命令之xargs
abbrlink: d680904b
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - Command
date: 2022-10-04 22:49:07
---


多行输入单行输出：

```bash
# cat test
1 2 3
4 5 6

# cat test| xargs
1 2 3 4 5 6
```

多行输出

```bash
# cat test | xargs -n 2
1 2
3 4
5 6
```
自定义一个定界符

```bash
# -d 选项可以自定义一个定界符：
echo "nameXnameXnameXname" | xargs -dX
name name name name

# 结合 -n 选项使用：
echo "nameXnameXnameXname" | xargs -dX -n2
name name
name name
```

复制所有图片文件到 /data/images 目录下：

```bash
ls *.jpg | xargs -n1 -I {} cp {} /data/images
```

xargs 结合 find 使用
用 rm 删除太多的文件时候，可能得到一个错误信息：/bin/rm Argument list too long. 用 xargs 去避免这个问题：

```bash
find . -type f -name "*.log" -print0 | xargs -0 rm -f
# xargs -0 将 \0 作为定界符。
```

统计一个源代码目录中所有 php 文件的行数：

```bash
find . -type f -name "*.php" -print0 | xargs -0 wc -l
```

查找所有的 jpg 文件，并且压缩它们：

```bash
find . -type f -name "*.jpg" -print | xargs tar -czvf images.tar.gz
```

查找并替换

```bash
find -name '要查找的文件名' | xargs perl -pi -e 's|被替换的字符串|替换后的字符串|g'
```

去除换行符和首尾空格

```bash
echo "   11 22" | xargs echo -n
```