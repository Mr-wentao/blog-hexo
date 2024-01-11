---
title: Ubuntu20.04 xfce桌面环境 配置vncserver
abbrlink: bd65d26a
categories:
  - 基础运维
tags:
  - vnc
  - RemoteControl
  - Ubuntu
date: 2022-02-14 10:30:08
---

linux上搭建vncserver其实还是挺简单的，但是有不少坑，比如桌面环境不一样会有问题，奇葩的是很多教程会让你安装一个xfce桌面，这种只适合于目前是没有图形桌面的用户并且用户正好想要安装xfce桌面，不然就是扯淡。

本文记录一下我使用xubuntu（ubuntu和xfce桌面环境）过程中是如何配置vncserver的吧

> 友情提醒：本人是`xubuntu20.04`,如果你不是这个系统，可能需要做一些修改。

## 首先安装vncserver

开源的常见vncserver有以下几个：`tightvnc`  `tigervnc` 等

收费的`vncserver`有`realvncserver`，顺便提一句，`Realvncserver`基本上做的和windows一致了，安装完成就可以直接使用，图形化控制界面，非常简单易用。如果不介意付费软件的话，可以考虑，省的折腾。

```bash
sudo apt install tigervnc-standalone-server
```

## 创建vnc密码

```bash
vncpasswd
```

然后输入两次密码，最后看看是否启用观看密码，我一般都是n

密码会写入到`~/.vnc/passwd`目录，也就是`vncpasswd`命令不要加`sudo`，不然密码就创建到`/root/.vnc/`目录下了。  

> 非交互式创建vnc密码 `echo 123456 | vncpasswd -f > ~/.vnc/passwd`

## 创建systemd配置

sudo vim /etc/systemd/system/vncserver.service

```ini
[Unit]
Description=Remote desktop service (VNC)
After=syslog.target network.target

[Service]
Type=forking
User=iuxt
Group=iuxt
WorkingDirectory=/home/iuxt

ExecStartPre=/bin/sh -c '/usr/bin/vncserver -kill :1 > /dev/null 2>&1 || :'
ExecStart=/usr/bin/vncserver -xstartup 'startxfce4' -localhost no :1
PIDFile=/home/iuxt/.vnc/%H:1.pid
ExecStop=/bin/sh -c '/usr/bin/vncserver -kill :1 > /dev/null 2>&1 || :'

[Install]
WantedBy=multi-user.target
```

> - 上面的`:1`表示标准端口（5900）+1，也就是5901端口，`:1`也可以改成`:%i`，systemd配置文件名修改成`vncserver@.service`，然后使用`systemctl start vncserver@1.service`来启动，即可实现端口自定义。
> - 上面的iuxt是我的用户，vncserver也是用这个用户启动的。  
> - 上面的`-startup`参数是连接vnc的启动命令，我们只需要启动桌面就好了。如果不是xfce桌面，可以替换一下启动命令，也可以手动安装xfce桌面,` sudo apt install xfce4 xfce4-goodies`  
> 常见桌面环境启动命令：
> | 桌面     | 启动命令         |
> | -------- | ---------------- |
> | xfce     | startxfce4       |
> | Cinnamon | cinnamon-session |
> | gnome    | gnome-session    |
