---
title: 常用shell组合命令
abbrlink: 90ca4905
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - Shell
  - Script
date: 2021-02-19 18:37:48
---

## 循环遍历

### {1..3} 这种格式

```bash
# i 取值为1 2 3
for i in {1..3}; do echo 192.168.1.1$i ; done

# i 取值为 1 3 5 7 9
for i in {1..9..2} ; do echo $i ; done

# 批量删除文件，相当于排列组合
rm -rf redis-{1..6}/{appendonly.aof,nodes.conf,nohup.out}
```

### seq

```bash
# i 的取值是 1 3 5 7 9, 1开始9结束，2是步进
for i in $(seq 1 2 9) ; do echo $i ; done
```

### for循环

```bash
for ((i=1;i<=10;i++))
do
    echo $i
done
```

### while 循环

```bash
# 死循环
i=0
while true
do
  echo "$i: $(date)"
  i=$((i+1))
  sleep 1
done
```

### 遍历列表

```bash
#!/bin/bash
list=(
10.66.99.204
10.66.230.25
10.66.219.220
)

for i in ${list[*]};
do
    echo $i
    if [ $(iptables -L|grep -v grep|grep $i|wc -l) -eq 0 ];then
      iptables -I OUTPUT -d $i -j DROP
    fi
done
```

> 这个list也可以写成 `list=(a b c)` 这种形式

## 条件判断

[shell条件判断](/posts/le2ugemu/)

## 脚本里的交互命令

### 修改密码

```bash
#!/bin/sh
passwd ubuntu<<-'EOF'
ubuntu
ubuntu
EOF
```

### 自动执行fdisk

```bash
echo "n
p
1




w
" | fdisk /dev/vdb && mkfs.ext4 /dev/vdb1
```

## 删除文件

### 只保留最近20个jar版本

```bash
ls -t *.jar | awk 'NR>20' | xargs rm -f
```

## 写入文件

### 不处理变量

```bash
#! /bin/bash
cat>filename.txt<<-'EOF'
hello
world
EOF
```

### 这样的可以处理变量

```bash
#! /bin/bash
cat>>filename.txt<<EOF
$hello
world
EOF
```

### 使用sudo写入

```bash
sudo -E cat > /etc/cni/net.d/10-mynet.conf <<EOF
{
  "cniVersion": "0.2.0",
  "name": "mynet",
  "type": "bridge",
  "bridge": "cni0",
  "isGateway": true,
  "ipMasq": true,
  "ipam": {
    "type": "host-local",
    "subnet": "172.19.0.0/24",
    "routes": [
      { "dst": "0.0.0.0/0" }
    ]
  }
}
EOF
```

### 写入内容控制台看得见

> tee -a 为追加, tee前面可以加sudo

```bash
tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
```

或者

```bash
echo "
xxx
yyy
" | sudo tee /etc/apt/sources.list
```

## 运行5s自动退出

```bash
#!/bin/bash
sleep 5 && kill $$ &

while true;do echo $RANDOM ; sleep 1;done
```

## 脚本里获取目录或名字

### 脚本里获取路径

这种方法可能是绝对路径，也可能是相对路径：

```bash
echo `dirname $0`
```

绝对路径

```bash
echo $(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
```

### 脚本里获取脚本文件名

> $0 在bash里表示执行脚本的命令，如`./xx.sh`或`/opt/xxx.sh`

```bash
echo `basename $0`
```

## 批量启动服务

```bash
#!/bin/bash
for i in `ls /data/wwwroot/`
do
    cd /data/wwwroot/$i && ./restart.sh
done
```

## 判断里面有变量，用双中括号

```bash
elif [[ "${refs}" == refs/tags/shp-* ]];then
```

## sudo 执行命令

举个例子

```bash
]$ echo 1 > /root/1
-bash: /root/1: Permission denied

]$ sudo echo 1 > /root/1
-bash: /root/1: Permission denied


sudo sh -c 'echo 1 > /root/1'     # 这样环境变量用的是root的
sudo -E sh -c 'echo $SHELL'       # 保留了当前用户的环境变量，比如~/.bashrc里面的配置
```

## 截取文件名或路径名

```bash
> basename /var/log/alternatives.log
alternatives.log

> dirname /var/log/alternatives.log
/var/log
```

## 去除字符串中间的空格

```bash
# 去除文本中的空格，相当于python里面的strip()
echo "   lo l  " | xargs

# 也可以用sed，不过感觉不优雅，会把所有空格都去掉
echo "   lo l  " | sed 's/ //g'
```

## 输入yes或no执行不同的选项

```bash
#!/bin/bash

read -r -p "Are You Sure? [Y/n] " input

case $input in
  [yY][eE][sS]|[yY])
    echo "Yes"
  ;;

  [nN][oO]|[nN])
    echo "No"
  ;;

  *)
    echo "Invalid input..."
    exit 1
  ;;
esac
```



## 获取网卡IP

```bash
ip addr | grep inet | egrep -v '(127.0.0.1|inet6|docker)' | awk '{print $2}' | tr -d "addr:" | head -n 1 | cut -d / -f1
```



## 获取网卡设备名

```bash
cat /proc/net/dev | awk '{print $1}' | grep ":" | grep -Ev "lo|docker|vnet|br" | sed 's/://'
```

## 获取当前目录下的所有目录

```bash
#!/bin/bash
for i in $(ls -d */); do
  cd $i
  git pull
  cd ..
done
```
