---
title: Shell脚本接受参数
abbrlink: 7635ef7e
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - 基础运维
tags:
  - Shell
  - Script
date: 2021-06-29 14:04:03
---

## 直接传参

一般情况下直接传参，比如

test.sh

```bash
#!/bin/bash
echo hello $1
```

./test.sh world
hello world

## 使用getopts解析参数

这种方法可以忽略参数位置，使脚本更完善

test.sh

```bash
while getopts "a:b:c" arg           #选项后面的冒号表示该选项需要参数
do
    case $arg in
        a)
            echo "a $OPTARG"    #参数存在$OPTARG中
        ;;
        b)
            echo "b $OPTARG"
        ;;
        c)
            echo "c"
        ;;
        ?)                     #当有不认识的选项的时候arg为?
            echo "unkonw argument"
            exit 1
        ;;
    esac
done
```

```bash
~$ ./test.sh -a 1 -b 2 -c  
a 1  
b 2  
c
```

## 使用shift

```bash
#!/bin/bash

help() {
    cat <<-EOF
这里是帮助文档
EOF
}

[ $# -eq 0 ] && help && exit 0
while [[ $# -gt 0 ]]; do
    case "$1" in
    -n | --name)
        name="$2"
        shift
        ;;
    -c | --count)
        count="$2"
        shift
        ;;
    -h | --help)
        help
        exit 0
        ;;
    --)
        shift
        ;;
    *)
        help
        exit 0
    esac
    shift
done

echo name: $name
echo count: $count

```
