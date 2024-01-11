---
title: Shell数学运算
abbrlink: cd044a59
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - 基础运维
tags:
  - Shell
  - Script
date: 2021-08-06 09:48:41
---

## bash 自带的数学运算

> 不依赖其他包，只要你的shell是bash

```bash
echo $(( 1  + 1 ))
echo $(( 1  - 3 ))
echo $(( 10 * 3 ))
echo $(( 10 / 3 ))
```

## expr

> expr 可以当计算器用不过它主要还是个计数器

### 字符串操作

```bash
# 计算字符串长度
expr length "hello world"

# 抓取字符串，3表示从第3个字符开始，5表示抓取的字符串长度
expr substr "hello world" 3 5

# 抓取第一个字符串出现的位置
expr index "hello world" o
```

### 四则运算

```bash
expr 10 % 3
expr 10 + 10
expr 30 / 3 / 2
expr 30 \* 3        # 使用乘号时，必须用反斜线屏蔽其特定含义。
```

## bc

> bc 是一个命令行的计算器工具，有些过于精简的发行版没有自带。

支持浮点数四则运算

```bash
echo "1.1 + 2.2" | bc
echo "1.1 - 2.2" | bc
echo "2 * 2.2" | bc

# 除法取得是整数部分，小数部分舍弃
echo "9 / 6" | bc

# 保留小数点后两位
echo "scale=2; 9/6" | bc

# 开根号
echo "sqrt(100)" | bc

# 指数
echo "10^3" | bc

# 取余数
echo "10 % 3" | bc
```

## awk

```bash
awk 'BEGIN{print 4.5+3.4 }'
awk 'BEGIN{print 4.5-3.4 }'
awk 'BEGIN{print 4.5*3.4 }'

# 除法awk会保留小数点后6位
awk 'BEGIN{print 1/3 }'

# 混合运算
awk 'BEGIN{print (2.2 - 1.1)*2+3 }'
```
