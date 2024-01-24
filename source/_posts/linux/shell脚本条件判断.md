---
title: shell脚本条件判断与比较运算
categories:
  - linux
tags:
  - shell
abbrlink: le2ugemu
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
date: 2023-02-13 21:21:25
---


## if 的基本语法:

```bash
if [ -f /tmp ];then
   echo "是一个普通文件"
elif [ -d /tmp ];then
   echo "是一个目录"
else
   echo "其他类型"
fi
```

## 文件/目录 判断

常用的

| 运算符 | 作用                       |
| ------ | -------------------------- |
| -d     | 测试文件是否为目录         |
| -e     | 测试文件是否存在           |
| -f     | 判断是否为一般文件         |
| -r     | 测试当前用户是否有权限读取 |
| -w     | 测试当前用户是否有权限写入 |
| -x     | 测试当前用户是否有权限执行 |
| -s     | 文件长度不为零             |


|选项|作用|
|---|---|
|[ -b FILE ] |如果 FILE 存在且是一个块特殊文件则为真。|
|[ -c FILE ] |如果 FILE 存在且是一个字特殊文件则为真。|
|[ -d DIR ] |如果 FILE 存在且是一个目录则为真。|
|[ -e FILE ] |如果 FILE 存在则为真。|
|[ -f FILE ]| 如果 FILE 存在且是一个普通文件则为真。|
|[ -g FILE ]| 如果 FILE 存在且已经设置了SGID则为真。|
|[ -k FILE ] |如果 FILE 存在且已经设置了粘制位则为真。|
|[ -p FILE ] |如果 FILE 存在且是一个名字管道(F如果O)则为真。|
|[ -r FILE ] |如果 FILE 存在且是可读的则为真。|
|[ -s FILE ] |如果 FILE 存在且大小不为0则为真。|
|[ -t FD ] |如果文件描述符 FD 打开且指向一个终端则为真。|
|[ -u FILE ]| 如果 FILE 存在且设置了SUID (set user ID)则为真。|
|[ -w FILE ]| 如果 FILE存在且是可写的则为真。|
|[ -x FILE ] |如果 FILE 存在且是可执行的则为真。|
|[ -O FILE ] |如果 FILE 存在且属有效用户ID则为真。|
|[ -G FILE ] |如果 FILE 存在且属有效用户组则为真。|
|[ -L FILE ] |如果 FILE 存在且是一个符号连接则为真。|
|[ -N FILE ] |如果 FILE 存在 and has been mod如果ied since it was last read则为真。|
|[ -S FILE ] |如果 FILE 存在且是一个套接字则为真。|
|[ FILE1 -nt FILE2 ] |如果 FILE1 has been changed more recently than FILE2, or 如果 FILE1 exists and FILE2 does not则为真。|
|[ FILE1 -ot FILE2 ] |如果 FILE1 比 FILE2 要老, 或者 FILE2 存在且 FILE1 不存在则为真。|
|[ FILE1 -ef FILE2 ] |如果 FILE1 和 FILE2 指向相同的设备和节点号则为真。|


## 字符串判断

常用的

| 运算符 | 作用                    |
| ------ | ----------------------- |
| =      | 判断字符串内容是否相同  |
| !=     | 判断字符串内容是否不同  |
| -z     | 字符串长度为0，返回真   |
| -n     | 字符串长度不为0，返回真 |

|选项|作用|
|---|---|
|[ -z STRING ] |如果STRING的长度为零则为真 ，即判断是否为空，空即是真；|
|[ -n STRING ] |如果STRING的长度非零则为真 ，即判断是否为非空，非空即是真；|
|[ STRING1 = STRING2 ] |如果两个字符串相同则为真 ；|
|[ STRING1 != STRING2 ] |如果字符串不相同则为真 ；|
|[ STRING1 ]　| 如果字符串不为空则为真,与-n类似|

## 数值判断

常用的

| 运算符 | 作用           |
| ------ | -------------- |
| -eq    | 是否等于       |
| -ne    | 是否不等于     |
| -gt    | 是否大于       |
| -lt    | 是否小于       |
| -le    | 是否小于或等于 |
| -ge    | 是否大于或等于 |


|选项|作用|
|---|---|
|INT1 -eq INT2     |     INT1和INT2两数相等为真 ,=|
|INT1 -ne INT2           |INT1和INT2两数不等为真 ,<>|
|INT1 -gt INT2          |  INT1大于INT1为真 ,>|
|INT1 -ge INT2       |    INT1大于等于INT2为真,>=|
|INT1 -lt INT2         |    INT1小于INT2为真 ,<|
|INT1 -le INT2          |   INT1小于等于INT2为真,<=|

## 其他逻辑判断

|选项|作用|
|---|---|
|-a |与|
|-o| 或|
|! |非|


## || 和 &&

> || 前面执行不通过才执行后面的，也就是或， && 是与，前面执行通过会接着执行后面的

```bash
[ -d /tmp/111 ] || { mkdir /tmp/111; cd /tmp/111; pwd; }

# 三元判断
[ -e .env.exampl ] && echo "文件存在" || echo "文件不存在"
```

### 模糊判断

判断字符串是否包含

```bash
NAMESPACE=xxxgrayxxx
if [[ $NAMESPACE =~ prod ]] || [[ $NAMESPACE =~ gray ]]
then
    echo "是prod或gray"
else
    echo "不重要的环境，随便造"
fi
```
