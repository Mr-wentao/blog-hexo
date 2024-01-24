---
title: Linux网络之Bridge和Bond
abbrlink: 8ec7155e
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - linux
tags:
  - Linux
  - Network
date: 2021-06-09 09:56:11
---

> 网桥相当于一台虚拟交换机，你可以把自己的网卡绑定在虚拟交换机上，并把其他接口（比如虚拟机的网络）桥接到这个网卡上面来，相当于大家都是在一个内网里面。

创建网桥方法, 以Redhat系为例。

## 使用nmtui创建网桥

1. 删除网卡配置文件  
   可以到`/etc/sysconfig/network-scripts/`里面删除`ifcfg-`开头的配置  
2. 使用nmtui创建网桥，并将网卡设备绑定到网桥， 一般关闭生成树协议（STP）  
3. 检查`/etc/sysconfig/network-scripts/`里面有没有多余的配置文件，有的话需要删除以免冲突  
4. 网卡和网桥都需要开机自启动  
![nmtui](https://static.zahui.fan/images/nmtui.gif)

## 使用配置文件创建网桥

> 生成uuid `cat /proc/sys/kernel/random/uuid` 或者 `uuidgen`

```bash
#!/bin/bash
set -euf -o pipefail

BRIDGE_UUID=$(uuidgen)
BRIDGE_NAME=br13
NET_UUID=$(uuidgen)
NET_DEVICE=ens33

cat >/etc/sysconfig/network-scripts/ifcfg-${NET_DEVICE} <<EOF
TYPE=Ethernet
NAME=${NET_DEVICE}
UUID=${NET_UUID}
DEVICE=${NET_DEVICE}
ONBOOT=yes
BRIDGE=${BRIDGE_NAME}
BRIDGE_UUID=${BRIDGE_UUID}
EOF

cat >/etc/sysconfig/network-scripts/ifcfg-${BRIDGE_NAME} <<EOF
STP=no
BRIDGING_OPTS=multicast_snooping=0
TYPE=Bridge
PROXY_METHOD=none
BROWSER_ONLY=no
IPV6INIT=no
NAME=${BRIDGE_NAME}
UUID=${BRIDGE_UUID}
DEVICE=${BRIDGE_NAME}
BOOTPROTO=dhcp
ONBOOT=yes
EOF
```

## 使用配置文件创建bond并绑定网桥

```bash
#!/bin/bash

cat <<EOF > /etc/sysconfig/network-scripts/ifcfg-eno1
TYPE="Ethernet"
BOOTPROTO="none"
DEVICE="eno1"
ONBOOT="yes"
MASTER=bond0
SLAVE=yes
EOF

cat <<EOF > /etc/sysconfig/network-scripts/ifcfg-eno2
TYPE="Ethernet"
BOOTPROTO="none"
DEVICE="eno2"
ONBOOT="yes"
MASTER=bond0
SLAVE=yes
EOF

cat <<EOF > /etc/sysconfig/network-scripts/ifcfg-bond0
DEVICE=bond0
TYPE=Bond
ONBOOT=yes
BONDING_OPTS="downdelay=0 updelay=0 miimon=100 mode=802.3ad xmit_hash_policy=1"
BRIDGE=br13
BONDING_MASTER=yes
NAME="bond0"
EOF

cat <<EOF > /etc/sysconfig/network-scripts/ifcfg-br13
DEVICE=br13
TYPE=Bridge
ONBOOT=yes
BOOTPROTO=dhcp
STP=no
BRIDGING_OPTS=multicast_snooping=0
PROXY_METHOD=none
BROWSER_ONLY=no
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=no
NAME=br13
EOF
```
