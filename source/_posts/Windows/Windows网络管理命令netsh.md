---
title: Windows网络管理命令netsh
abbrlink: f85b3ad3
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - Windows
tags:
  - Windows
date: 2021-05-13 19:27:17
---


> netsh 是windows平台网络管理命令

## 防火墙设置

### 开启防火墙

```bat
sc config mpsdrv start= auto
sc config mpssvc start= auto
sc start mpsdrv
sc start mpssvc

netsh advfirewall set allprofiles state on
```


### 规则配置

```bat
:: 拒绝指定IP访问指定端口
netsh advfirewall firewall add rule name=BlockRTX dir=in protocol=tcp localport=8000 action=block enable=yes remoteip=192.168.5.2

:: 开放一个端口
netsh advfirewall firewall add rule name="445" protocol=TCP dir=in localport=445 action=allow

:: windows xp 使用
netsh firewall set portopening TCP 445 ENABLE
```

### 防火墙配置

```bat
:: 关闭防火墙
netsh firewall set opmode mode=disable

:: 防火墙恢复默认配置
netsh firewall reset
```

## 修改网络设置

### 修改ip、dns等

```bat
# STATIC
netsh interface ip set address "以太网" static 192.168.8.88 255.255.252.0 192.168.8.3
netsh interface ip set dns "以太网" static 114.114.114.114
netsh interface ip add dns "以太网" 114.114.115.115

# DHCP
netsh interface ip set address "以太网" dhcp
netsh interface ip set dns "以太网" dhcp
```
