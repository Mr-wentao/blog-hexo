---
title: WSL常用操作记录
abbrlink: eee9a081
categories:
  - Windows
tags:
  - Windows
  - WSL
  - 配置记录
date: 2021-03-11 11:21:46
---

## 常用操作

### 导出

```bat
wsl --export centos7 centos7.tar
```

### 导入

```bat
wsl --import centos7 C:\centos7 centos7.tar
```

### 启动指定发行版

```bat
wsl -d centos7
```

### 指定用户启动

```bat
wsl -d ubuntu -u root
```

## 开机自启

{% tabs TabName %}

<!-- tab WSL1 -->

win+r  输入 `shell:startup`写一个`wsl_start.bat`内容如下

```bat
wsl -d Ubuntu -u root /etc/init.d/ssh start
```

<!-- endtab -->

<!-- tab WSL2和Windows11 -->

sudo vim /etc/wsl.conf

```bash
[boot]
command = service docker start
```

<!-- endtab -->
{% endtabs %}

## 修改默认用户为root

{% tabs TabName %}

<!-- tab WSL1 -->

```bat
%localappdata%\Microsoft\WindowsApps\ubuntu.exe config --default-user root
```

> 根据你的发行版决定

<!-- endtab -->

<!-- tab WSL2和Windows11 -->

sudo vim /etc/wsl.conf

```bash
[user]
default = root
```

<!-- endtab -->
{% endtabs %}

## 安装想要的发行版

> 这里以centos为例

首先需要docker环境，执行

```bash
docker run --name centos7 centos:centos7
```

然后将容器导出

```bash
docker export centos7 > centos7.tar
```

然后在windows上导入

```bat
wsl --import centos7 C:\centos7 centos7.tar
```

启动发行版

```bat
wsl -d centos7
```

卸载发行版

```bat
wsl --unregister centos7
```

## 互相访问

### wsl 里运行windows 程序

```bash
# 运行windows里的python
py.exe update_gitee_pages.py

# 打开资源管理器
explorer.exe .
```

### windows里运行wsl程序

```bat
wsl -d ubuntu sudo bash -c "apt update"
```

### wsl里访问windows路径

```bash
cd /mnt/c/Users/iuxt/Desktop
```

### windows 里访问wsl文件

```bash
\\wsl$\Ubuntu\home\iuxt
```


### 快速在当前路径下打开wsl命令行

在资源管理器的地址栏直接输入wsl即可（输入cmd类似，是进入cmd命令行）

![快速打开wsl命令行](https://static.zahui.fan/images/202305041640284.png)

### bat脚本里调用wsl命令

```bat
wsl --shell-type login --cd ~/code/zahuifan -- code .
```

### 文件路径转换

```bash
# wsl路径转换为windows路径
❯ wslpath -w "/mnt/c/Program Files (x86)/Steam/steamapps"
C:\Program Files (x86)\Steam\steamapps

# windows路径转换为wsl路径
❯ wslpath "C:\Program Files (x86)\Steam\steamapps"
/mnt/c/Program Files (x86)/Steam/steamapps
```