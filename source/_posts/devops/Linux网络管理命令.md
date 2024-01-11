---
title: Linux网络管理命令
abbrlink: 211e1b4c
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - Command
  - Network
date: 2021-10-15 17:41:01
---


> 2009年 Debian 开发者邮件列表宣布放弃使用缺乏维护的net-tools工具包，net-tools包含历史悠久的ifconfig, netstat等网络相关的命令  
> iproute2用于取代net-tools，在大部分的发行版都自带了。命令有ip, ss, net等命令替代了之前的网络操作命令。

## 命令对照表

| net-tools        | iproute2            |
| ---------------- | ------------------- |
| arp -na          | ip neigh            |
| ifconfig         | ip link             |
| ifconfig -a      | ip addr show        |
| ifconfig -s      | ip -s link          |
| ifconfig eth0 up | ip link set eth0 up |
| ipmaddr          | ip maddr            |
| iptunnel         | ip tunnel           |
| netstat          | ss                  |
| netstat -i       | ip -s link          |
| netstat -g       | ip maddr            |
| netstat -l       | ss -l               |
| netstat -r       | ip route            |
| route add        | ip route add        |
| route del        | ip route del        |
| route -n         | ip route show       |
| vconfig          | ip link             |

## ip命令

### 配置ip或者接口

|                                                |                            |
| ---------------------------------------------- | -------------------------- |
| ip a                                           | 显示所有网络接口           |
| ip -4 a                                        | 显示所有 IPv4 相关网络接口 |
| ip a show eth0                                 | 查看特定的网络接口         |
| ip a add 192.168.80.174 dev eth0               | 添加ip地址                 |
| ip a del 192.168.80.174 dev eth0               | 删除ip地址                 |
| ip -s -s a f to 192.168.1.0/24                 | 清除所有接口上的所有地址   |
| ip link set dev eth0 address 00:0c:29:33:4e:aa | 添加MAC地址                |
| ip link set eth0 down                          | 禁用网络接口               |
| ip link set eth0 up                            | 启用网络接口               |
| ip link ls up                                  | 列出正在运行的网络接口     |
| ip link set dev eth0 arp on                    | 启用ARP协议                |
| ip link set txqueuelen 10000 dev eth0          | 设置队列传输长度           |
| ip link set mtu 9000 dev eth0                  | 设置最大传输单元           |

### 配置路由

```bash
# 查看所有路由表
ip r

# 添加/删除默认的网关
ip route add default via 192.168.1.254

# 添加路由
ip route add 192.168.1.0/24 dev eth0
ip route add 192.168.1.0/24 via 192.168.1.1

# 删除路由
ip route del 192.168.1.0/24 dev eth0
ip route del 192.168.1.0/24 via 192.168.1.1
```

## ss命令

> ss是Socket Statistics的缩写，用来获取socket统计信息，可以显示和netstat类似的内容。ss的优势在于它能够显示更多更详细的有关TCP和连接状态的信息，而且比netstat更快速更高效。

### SS命令使用实例

| 常用命令  | 作用                       |
| --------- | -------------------------- |
| ss -t -a  | 显示TCP连接                |
| ss -s     | 显示 Sockets 摘要          |
| ss -l     | 列出所有打开的网络连接端口 |
| ss -pl    | 查看进程使用的socket       |
| ss -u -a  | 显示所有UDP Sockets        |
| ss -anltp | 显示所有监听的tcp端口      |

### 用TCP 状态过滤Sockets

显示所有状态为Established的HTTP连接（http可以换成ssh或数字）

```bash
ss -anltp state established '( dport = :http or sport = :http )'
```

> state 可选的有

```sh
established
syn-sent
syn-recv
fin-wait-1
fin-wait-2
time-wait
closed
close-wait
last-ack
listen
closing

all :           所有以上状态
connected :     除了listen and closed的所有状态
synchronized :  所有已连接的状态除了syn-sent
bucket :        显示状态为maintained as minisockets,如：time-wait和syn-recv
big :           和bucket相反
```

## NetworkManager

> NetworkManager 是一个守护进程，用户不与 NetworkManager 系统服务直接互动，而是通过图形及命令行用户界面工具执行网络配置任务。Red Hat Enterprise Linux 7 中有以下工具可用：  
> nmtui nmcli 和一些图形界面管理工具等

参考文档: <https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/7/html/networking_guide/ch-introduction_to_rhel_networking>

查看NetworkManager状态

```bash
systemctl status NetworkManager
```

### nmcli

常用命令，connection可以简写成c

```bash
nmcli c reload                      重新加载配置文件
nmcli connection show               要显示所有链接
nmcli device status                 显示由 NetworkManager 识别到设备及其状态：
nmcli dev disconnect iface bond0    停止网络接口
nmcli con up ens33                  激活网络连接

```

### nmtui

安装

```bash
yum install NetworkManager-tui
```

文本图形工具，使用方法略
