---
title: 使用iptables做4层端口转发
abbrlink: 5e8ed38b
categories:
  - linux
tags:
  - iptables
  - 网络
date: 2022-07-19 17:32:38
---

用途：有两台机器，需要用其中的一台机器做跳板，转发另一台机器一个特定的端口，机器列表如下

| 机器         | IP             |
| ------------ | -------------- |
| iptables机器 | 10.0.0.41      |
| web服务器    | 10.0.0.42:8000 |

## 开启内核转发功能

{% tabs TabName %}

<!-- tab 临时开启 -->

```bash
sudo sysctl -w net.ipv4.ip_forward=1
```

或者

```bash
echo "1" > /proc/sys/net/ipv4/ip_forward
```

<!-- endtab -->

<!-- tab 永久开启 -->

```bash
sudo vim /etc/sysctl.conf

# 保证是这个配置
net.ipv4.ip_forward=1

# 立即生效
sudo sysctl -p
```

<!-- endtab -->
{% endtabs %}

## 转发请求到目标主机

```bash
iptables -t nat -A PREROUTING -4 -p tcp -d 10.0.0.41 --dport 80 -j DNAT --to-destination 10.0.0.42:8000
```

## 转发数据包回路

```bash
iptables -t nat -A POSTROUTING -4 -p tcp -d 10.0.0.42 --dport 8000 -j MASQUERADE
```

## 其他操作

### 查看nat表

```bash
sudo iptables -t nat -L
```

### 清空nat表配置

```bash
sudo iptables -t nat -F
```

### 查看filter表

```bash
sudo iptables -L
```

### 清空filter表

```bash
sudo iptables -F
```

### iptables持久化

请看[iptables进行持久化配置，重启不丢失](/posts/d8f4121a)
