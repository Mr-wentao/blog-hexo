---
title: 笔记本电脑CPU性能被锁定在0.78GHz的原因及解决方案
abbrlink: 7a7fe042
categories:
  - Windows
tags:
  - 配置记录
date: 2021-12-04 23:47:45
---

> 家里的旧笔记本电脑使用电池正常工作，但是插上电源就锁频率800MHz，非常的卡，Google了一下，总结如下。

## 出现这种情况的原因

> 可能是由于供电不好，比如充电器非原装，或者散热不行系统会自动降低cpu频率来保证系统稳定

## 一劳永逸的解决方案

1. 使用原装的充电器
2. 定期清理笔记本电脑灰尘
3. 看看bios里面有没有相关的设置BD PROCHOT，把它关掉，或者升级bios试试看看。

## Windows系统怎么解决

Just download throttlestop and Disable BD PROCHOT and Turbo  
不过每次重启都需要重新设置一下  
![ThrottleStop](https://static.zahui.fan/images/throttlestop.png)  
官网下载地址：<https://www.techpowerup.com/download/techpowerup-throttlestop/>

## Ubuntu系统怎么解决

```bash
apt install cpufrequtils msr-tools -y
cpufreq-set -c 0 -g performance
cpufreq-set -c 1 -g performance
cpufreq-set -c 2 -g performance
cpufreq-set -c 3 -g performance
modprobe msr
wrmsr 0x1FC 17422
```

上面的0123需要和CPU核心数对应  
需要每次开机都运行一遍（需要ROOT权限）  
