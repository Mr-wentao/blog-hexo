---
title: 使用expect来解决命令交互问题
abbrlink: 751c3cf9
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - 基础运维
tags:
  - Script
  - Bash
date: 2021-11-16 18:18:50
---

linux里面很多命令都是需要人为交互的，对于做成脚本来说，有点不合适了，比如通过密码连接SSH必须要在控制台输入密码（安全起见还是用rsa key），`expect`是预期的意思，它可以实现我们预期的结果。

## 安装

- ubuntu/debian

  ```bash
  sudo apt install -y expect
  ```

- centos/rhel

  ```bash
  sudo yum install -y ecpect
  ```

## 解释器使用expect

```bash
#!/usr/bin/expect

set IP     [lindex $argv 0] # 读取第1个参数设置为 IP 变量
set PASSWD [lindex $argv 1] # 读取第2个参数设置为 PASSWD 变量
set CMD    [lindex $argv 2] # 读取第3个参数设置为 CMD 变量

spawn ssh $IP $CMD # spawn 来给命令加壳，以便于断言输出
expect { # expect 是断言命令
  # 如果读取到屏幕上输出 (yes/no) 信息，则输入 "yes" 并按下回车键
  # exp_continue 是继续等待花括号内的断言, 如果不加这一句会直接跳出 expect
  "(yes/no)?" { send "yes\r"; exp_continue }

  "password:" { send "$PASSWD\r" } # 如果读取到屏幕上输出 password 信息，则输入 PASSWD 变量中的内容
  "*host " { exit 1 } # 如果读取到 "No route to host" 等内容， 就以非0状态退出
}
expect eof # 等待命令执行结束
```

这种方式由于解释器使用了expect，所以只能使用有限的命令，不是很推荐

## 解释器使用bash

> 假设certbot不支持非交互使用

```bash
#!/bin/bash
export LC_CTYPE="en_US.UTF-8"
expect -c '
set timeout 3
spawn ssh user@<host> -p 60022
expect "password"
send "password\r"
interact
'
```

## 直接使用expect命令

> 这种和切换解释器类似， 类比于`./test.sh`和`bash test.sh`的关系。

vim test.sh

```bash
spawn ldapadd -x -D cn=Manager,dc=nutstore,dc=com -W -f /vagrant/basedomain.ldif
expect {
"Enter LDAP Password:" {send "123456\n";exp_continue}
eof
}
```

```bash
expect test.sh
```
