---
title: 编写安全健壮的shell脚本
abbrlink: b82d63c2
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - shell
  - bash
  - script
date: 2022-04-03 10:13:14
---

编写shell脚本容易出现的问题：比如变量为空的时候，管道报错等，容易引起一系列问题甚至灾难性的结果。  
可以借助工具<https://www.shellcheck.net/>来检查脚本里面可以改进的地方。

## 脚本里使用set

建议使用

```bash
set -euo pipefail
```

### set -o

`set -o` 可以查看shell的选项开关，比如常用的`pipefail`

```bash
set -o | pipefail
```

pipefail 是指在一个管道命令中，任意一个命令执行失败就认为命令报错（但是可以继续执行，想让它报错退出需要再加上set -e）

可以在shell脚本开头加上`set -o pipefail`，我们来看一个例子：

```bash
#!/bin/bash
set -o pipefail
cat test.txt | tee test2.txt
echo $?

# 假设test.txt不存在，这个时候输出的是1
# 如果去掉 set -o pipefail，这个时候输出的是0
```

### set -e

set -e 是指任意一条命令返回值不是0，脚本就退出不继续执行了。

如果有些程序想要人为的忽略报错，可以在命令开始前加上set +e，命令结束的时候再set -e，如：

```bash
#!/bin/bash
set -e
...
set +e
cmd
set -e
...
```

### set -u

将未设置的参数或者变量视为错误并退出脚本。

```bash
#!/bin/bash
set -u
echo 111
echo ${123}
echo 222
```

这个时候只会执行echo 111，因为${123}不存在，脚本就报错退出了。

### set -x

调试模式，会把每一个shell命令执行的结果都打印出来，效果等同于`bash -x test.sh`

### set -f

禁用文件名通配符，比如脚本

```bash
#!/bin/bash
set -f
rm -rf *.md
```

这个时候只会删除文件名为`*.md`的文件，并不会把所有.md的文件都删除。

## 编写脚本注意事项

| 错误示范  | 正确示范    |
| --------- | ----------- |
| a=\`pwd\` | a=$(pwd)    |
| echo $a   | echo "${a}" |

## trap捕获错误

trap是捕获信号的命令，常用的信号有：

| **编号** | **信号名称** | **缺省动作** | **描述**                                                                                               |
| -------- | ------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| 1        | SIGHUP       | 终止         | 终止进程，挂起                                                                                         |
| 2        | SIGINT       | 终止         | 键盘输入中断命令，一般是CTRL+C                                                                         |
| 3        | SIGQUIT      | CoreDump     | 键盘输入退出命令，一般是CTRL+\                                                                         |
| 4        | SIGILL       | CoreDump     | 非法指令                                                                                               |
| 5        | SIGTRAP      | CoreDump     | trap指令发出，一般调试用                                                                               |
| 6        | SIGABRT      | CoreDump     | abort(3)发出的终止信号                                                                                 |
| 7        | SIGBUS       | CoreDump     | 非法地址                                                                                               |
| 8        | SIGFPE       | CoreDump     | 浮点数异常                                                                                             |
| 9        | SIGKILL      | 终止         | 立即停止进程，不能捕获，不能忽略                                                                       |
| 10       | SIGUSR1      | 终止         | 用户自定义信号1，像Nginx就支持USR1信号，用于重载配置，重新打开日志                                     |
| 11       | SIGSEGV      | CoreDump     | 无效内存引用                                                                                           |
| 12       | SIGUSR2      | 终止         | 用户自定义信号2                                                                                        |
| 13       | SIGPIPE      | 终止         | 管道不能访问                                                                                           |
| 14       | SIGALRM      | 终止         | 时钟信号，alrm(2)发出的终止信号                                                                        |
| 15       | SIGTERM      | 终止         | 终止信号，进程会先关闭正在运行的任务或打开的文件再终止，有时间进程在有运行的任务而忽略此信号。不能捕捉 |
| 16       | SIGSTKFLT    | 终止         | 处理器栈错误                                                                                           |
| 17       | SIGCHLD      | 可忽略       | 子进程结束时，父进程收到的信号                                                                         |
| 18       | SIGCONT      | 可忽略       | 让终止的进程继续执行                                                                                   |
| 19       | SIGSTOP      | 停止         | 停止进程，不能忽略，不能捕获                                                                           |
| 20       | SIGSTP       | 停止         | 停止进程，一般是CTRL+Z                                                                                 |
| 21       | SIGTTIN      | 停止         | 后台进程从终端读数据                                                                                   |
| 22       | SIGTTOU      | 停止         | 后台进程从终端写数据                                                                                   |
| 23       | SIGURG       | 可忽略       | 紧急数组是否到达socket                                                                                 |
| 24       | SIGXCPU      | CoreDump     | 超出CPU占用资源限制                                                                                    |
| 25       | SIGXFSZ      | CoreDump     | 超出文件大小资源限制                                                                                   |
| 26       | SIGVTALRM    | 终止         | 虚拟时钟信号，类似于SIGALRM，但计算的是进程占用的时间                                                  |
| 27       | SIGPROF      | 终止         | 类似与SIGALRM，但计算的是进程占用CPU的时间                                                             |
| 28       | SIGWINCH     | 可忽略       | 窗口大小改变发出的信号                                                                                 |
| 29       | SIGIO        | 终止         | 文件描述符准备就绪，可以输入/输出操作了                                                                |
| 30       | SIGPWR       | 终止         | 电源失败                                                                                               |
| 31       | SIGSYS       | CoreDump     | 非法系统调用                                                                                           |

### 程序退出后删除临时文件

有时候我们的脚本会生成一些临时文件，虽然可以在脚本最后删除这些临时文件，但是有些例外情况比如脚本报错，这样临时文件就不能及时地清理掉，这个时候我们可以利用trap捕获EXIT信号来执行我们想要的命令。

```bash
#!/bin/bash
some_cmd
clean_up() {
    rm -rf /tmp/*
    echo "cleaned up ..."
}

trap 'clean_up' EXIT
```

### 程序意外退出删除临时文件

```bash
#!/bin/bash
some_cmd
clean_up() {
    rm -rf /tmp/*
    echo "cleaned up ..."
}

trap 'clean_up' SIGHUP SIGINT SIGTERM
```

## 生成临时文件

可以使用mktemp命令生成tmp文件，mktemp -d生成临时目录，避免临时目录重复使用的问题

```bash
#!/bin/bash
tmp_file="$(mktemp)"
tmp_folder="$(mktemp -d)"

echo $tmp_file
echo $tmp_folder
```
