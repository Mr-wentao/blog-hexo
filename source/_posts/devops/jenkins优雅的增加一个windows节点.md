---
title: jenkins优雅的增加一个windows节点
categories:
  - devops
tags:
  - jenkins
  - windows
  - agnet
  - cygwin
abbrlink: 288e897b
cover: 'https://static.zahui.fan/images/202304111550061.svg'
date: 2023-04-11 14:54:37
---

## 配置windows

这里我选择使用ssh来连接windows，这样可以完全由jenkins来管理windows节点，比如agent的启动与停止、agent的更新等都不需要登录windows来操作了。

### 安装openssh server

~~这里选择moba ssh server， 下载地址：<https://mobassh.mobatek.net/download.html>~~  moba ssh server 基于 cygwin 和原生windows有差别，特殊情况下执行结果不一致，我放弃了，转而使用原生 openssh 服务

GitHub地址：<https://github.com/PowerShell/Win32-OpenSSH/releases>

最新版和jenkins兼容性有些问题，我用的是 v8.1.0.0p1-Beta 版， 下载 OpenSSH-Win64.zip 解压到 windows 的 `C:\Program Files\OpenSSH` 目录下，然后执行(管理员权限运行powershell)

```powershell
cd "C:\Program Files\OpenSSH"

# 安装sshd服务
powershell -ExecutionPolicy Bypass -File install-sshd.ps1

# 防火墙打开22端口
netsh advfirewall firewall add rule name=sshd dir=in action=allow protocol=TCP localport=22

# 设置开机自启动
Set-Service sshd -StartupType Automatic
Set-Service ssh-agent -StartupType Automatic

# 启动服务
Start-Service sshd
Start-Service ssh-agent
```

### 配置java环境

jenkins默认不会读取环境变量， 所以我们需要手动复制java的文件夹到工作目录，假设工作目录设定为`C:\jenkins-agent`, 那么java路径就是`C:\jenkins-agent\jdk\bin\java.exe`

### 测试

使用jenkins机器（主节点）执行：`ssh user@<windows ip>` 连接成功即可。

## 配置jenkins

jenkins 系统管理 -->  节点管理

![配置从节点](https://static.zahui.fan/images/202304111530133.png)

![添加凭据](https://static.zahui.fan/images/202304111531143.png)


## 构建流水线

确认节点上线了。
![节点状态](https://static.zahui.fan/images/202304111546325.png)

这里限制构建所在的节点
![指定构建节点](https://static.zahui.fan/images/202304111546102.png)

构建过程选择 执行 Windows 批处理命令
![构建步骤](https://static.zahui.fan/images/202304111547029.png)

已经可以正常构建了
![构建输出](https://static.zahui.fan/images/202304111728884.png)

## 常见问题

在windows里面可以正常执行，在jenkins提示命令不存在， 原因是jenkins不会加载windows自带的配置文件，解决方法：

1. 使用绝对路径
2. 配置PATH环境变量到jenkins
3. 手动配置你需要的工具的路径

![命令不存在](https://static.zahui.fan/images/202304111819597.png)

我更喜欢第二种方法：

到windows里面cmd执行 path命令，将path后面的值复制

![path结果](https://static.zahui.fan/images/202304111821871.png)

配置在 jenkins  -->  节点列表  -->  相关节点的环境变量中。

![配置环境变量](https://static.zahui.fan/images/202304111822648.png)