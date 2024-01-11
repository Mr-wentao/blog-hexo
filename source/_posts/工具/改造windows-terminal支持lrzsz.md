---
title: 改造windows terminal支持lrzsz
categories:
  - 工具
tags:
  - Windows Terminal
  - WSL
  - lrzsz
abbrlink: e48170f8
cover: 'https://static.zahui.fan/images/202305102317430.png'
date: 2023-04-12 20:12:25
---

在windows下使用xshell，如果执行 rz 或者 sz 是可以快捷上传/下载文件到本地的，这在使用堡垒机登录服务器会很有用，或者多层ssh嵌套的时候，某种极端的场景下，这可能是唯一的解决方案了。在windows下使用xshell连接服务器，这时候输入rz，会弹出一个文件选择框：

![xshell 文件选框](https://static.zahui.fan/images/202304122017543.png)

但是在windows terminal下，是这样的：

![Windows Terminal乱码](https://static.zahui.fan/images/202304122018087.png)

无意中发现了一个开源工具，可以解决这个问题，开源地址是：<https://github.com/qingyunha/zssh>

## 安装
### 通过源码安装 

```bash
git clone https://github.com/qingyunha/zssh.git
cd zssh
go get zssh
```

默认可执行文件是在GOBIN中, 需要放到系统的PATH目录中。

### 二进制安装
```bash
curl -OL https://file.babudiu.com/f/4Oil/zssh
sudo mv zssh /usr/local/bin
sudo chmod +x /usr/local/bin/zssh
```

使用方法： 使用 `zssh` 替代 `ssh` 命令即可。

效果如下：

![rz上传](https://static.zahui.fan/images/202304131056437.png)


另外还有[trzsz](https://github.com/trzsz/trzsz) 这样的类似开源工具，需要服务器上安装trzsz软件
