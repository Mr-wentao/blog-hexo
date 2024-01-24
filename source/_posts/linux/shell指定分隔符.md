---
title: Shell指定分隔符
abbrlink: e93bd813
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - linux
tags:
  - Shell
  - Script
date: 2021-07-30 21:48:01
---

> 为什么要指定换行符，我们看一个例子

```bash
#!/bin/bash

data="
a b c
d e f
"

for i in $data
do
  echo $i
done
```

输出的结果是：

```bash
a
b
c
d
e
f
```

因为系统默认把空格和换行都当作了分隔符。为了避免这种情况，我们可以手动指定分隔符：

```bash
#!/bin/bash

data="
a b c
d e f
"

IFS=$'\n'        # 指定分隔符为换行
for i in $data
do
  echo $i
done
```

这样打印出来的就是：

```bash
a b c
d e f
```

再看一个例子：

```bash
#!/bin/bash
a="aa,bb,cc,dd,ee"
for i in $a
do
    echo $i
done
```

输出为：  
`aa,bb,cc,dd,ee`

我们想要的输出结果可能是这样

```bash
aa
bb
cc
dd
ee
```

可以修改成这样:

```bash
#!/bin/bash
oldIFS=$IFS        #定义变量为默认的IFS
IFS=,              #设置默认的分隔符
a="aa,bb,cc,dd,ee"
for i in $a
do
    echo $i
done
IFS=$oldIFS        #还原默认值
```

>还原默认值这一步也可以不操作，具体看这个操作会不会影响到后面的shell命令。
