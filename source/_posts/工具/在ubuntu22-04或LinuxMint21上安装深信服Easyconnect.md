---
title: 在ubuntu22.04或LinuxMint21上安装深信服Easyconnect
cover: 'https://static.zahui.fan/images/202308242246912.png'
categories:
  - 工具
tags:
  - 深信服
  - ubuntu
  - linuxmint
abbrlink: 6f69bd6
date: 2023-06-28 19:01:53
---

正常在ubuntu22.04或者linuxmint21上安装Easyconnect, 可以安装, 但是无法启动.

是因为pango这个库版本较高导致. 需要手动将低版本的动态链接库放到easyconnect程序目录下.

只想安装的朋友, 直接使用一键安装脚本即可, 不用看完这篇文章. 

## 一键安装脚本

> LinuxMint21 测试通过

```bash
curl -OL -C - https://download.sangfor.com.cn/download/product/sslvpn/pkg/linux_767/EasyConnect_x64_7_6_7_3.deb
curl -OL -C - https://file.babudiu.com/f/GzUA/EasyConnect_pango.tar.gz
curl -OL -C - https://file.babudiu.com/f/EGTp/install.sh
sudo bash ./install.sh
```

## 查看链接库

```bash
cd /usr/share/sangfor/EasyConnect
ldd EasyConnect | grep pango
```

![](https://static.zahui.fan/images/202306281905022.png)

## 下载对应的deb包

下载地址: <http://kr.archive.ubuntu.com/ubuntu/pool/main/p/pango1.0/>

amd64架构需要下载如下几个文件

```bash
libpangocairo-1.0-0_1.40.14-1_amd64.deb
libpangoft2-1.0-0_1.40.14-1_amd64.deb
libpango-1.0-0_1.40.14-1_amd64.deb
```


## 解压deb包

这3个deb包不需要安装, 解压把相关文件放到easyconnect安装目录即可

```bash
ar -vx libpangocairo-1.0-0_1.40.14-1_amd64.deb && tar xf data.tar.xz
ar -vx libpangoft2-1.0-0_1.40.14-1_amd64.deb && tar xf data.tar.xz
ar -vx libpango-1.0-0_1.40.14-1_amd64.deb && tar xf data.tar.xz
```

将解压后的 `usr/lib/x86_64-linux-gnu` 里面的所有文件复制到 `/usr/share/sangfor/EasyConnect`

```bash
sudo cp usr/lib/x86_64-linux-gnu/* /usr/share/sangfor/EasyConnect/
```

## 检查

再次检查链接库, 发现已经指向安装目录了

![](https://static.zahui.fan/images/202306281923022.png)
