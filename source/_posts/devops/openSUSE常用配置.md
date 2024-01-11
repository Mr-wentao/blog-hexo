---
title: openSUSE常用配置
abbrlink: 9f2e533a
categories:
  - devops
tags:
  - Linux
  - 配置记录
date: 2021-09-01 15:53:38
---

## 安装vscode

```bash
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ntype=rpm-md\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/zypp/repos.d/vscode.repo'

sudo zypper refresh
sudo zypper install code
```

## 安装vmware workstation

```bash
sudo zypper install gcc gcc-c++ kernel-source kernel-syms
```

然后正常安装vmware-workstation

## 关闭休眠，虚拟机建议操作一下

```bash
sudo systemctl stop sleep.target suspend.target hibernate.target hybrid-sleep.target
sudo systemctl disable sleep.target suspend.target hibernate.target hybrid-sleep.target
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

## 安装输入法

```bash
sudo zypper install fcitx-rime
```

在wayland下不能自动启动输入法，解决方案：
最新的稳定版 Fcitx 和 iBus 都已经了基本的 Wayland 支持，通过 X 的协议转接现。下一代的 Fcitx 将会提供对 Wayland 的直接支持。
Wayland 读取的环境配置文件是 /etc/environment 而不是 X 所读取的环境变量文件。因此对 X 有效的输入法配置在 Wayland 上不起效果了。以管理员权限编辑它：

```bash
sudo vi /etc/environment
```

这个文件应该是空的，只有几行注释。

- 以 Fcitx 为例：

    ```conf
    INPUT_METHOD=fcitx
    GTK_IM_MODULE=fcitx
    QT_IM_MODULE=fcitx
    XMODIFIERS=@im=fcitx
    ```

- 如果您使用 iBus 的话，那么应该添加这几行：

    ```conf
    INPUT_METHOD=ibus
    GTK_IM_MODULE=ibus
    QT_IM_MODULE=ibus
    XMODIFIERS=@im=ibus
    ```

之后请重启您的系统。

## 安装RDP客户端

### 使用freerdp

```bash
sudo zypper install freerdp
```

> 如果提示`Failed to find libav H.264 codec`，则需要安装
> `wget https://opensuse-community.org/codecs-kde.ymp` ，在dolphin里面打开这个文件
> 官方说明：<https://opensuse-guide.org/codecs.php>

连接：

```bash
xfreerdp /v:192.168.2.138 /u:<your username> /p:<your password> /w:1920 /h:1080 /cert:ignore
```

### 使用remmina

```bash
sudo zypper install remmina remmina-plugin-rdp
```

## 安装显卡驱动

64-bit : zypper install Mesa-libGL1 Mesa
32-bit : zypper install Mesa-libGL1-32bit Mesa-32bit

## 包管理zypper

### 搜索文件属于哪个包

```bash
sudo zypper search --provides /usr/bin/python3
```
