---
title: 安装和配置samba共享
tags:
  - samba
  - 配置记录
abbrlink: a7c8660c
categories:
  - devops
date: 2022-02-11 11:18:21
---

> 在windows平台创建smb共享是一件很方便的事情，右键共享即可，一直没有关心linux平台的smb服务，最近家里有一台装了ubuntu的笔记本，想放在角落里做nas用，所以看看如何搭建smb共享。

## 安装服务

```bash
apt install samba
```

如果不小心删除了配置文件，可以通过：

```bash
sudo apt purge samba-common samba
sudo apt install samba
```

来重新生成

## 创建samba用户

samba使用Linux的用户和权限系统，但是有自己的认证机制。

samba用户首先要是一个Linux用户，不然是创建不成功的。

### 创建一个Linux用户

```bash
sudo useradd -s /bin/bash -m zhanglikun
```

> -m 是在home目录自动创建一个zhanglikun目录

### 创建一个smb用户

```bash
sudo smbpasswd -a zhanglikun
```

手动输入两遍密码即可,其他操作可以通过`smbpass -h`查看

## 创建共享目录

使用zhanglikun用户在家目录创建一个共享目录

```bash
mkdir samba
```

## 修改配置文件

```bash
vim /etc/samba/smb.conf
```

保证 server role 是 standalone server（默认情况下就是如此）

```conf
   server role = standalone server

```

### 添加共享配置

```conf
[samba]
    path = /home/zhanglikun/samba
    browseable = yes
    read only = no
#    force create mode = 0660
#    force directory mode = 2770
    valid users = zhanglikun

# 下面是一个匿名只读配置
[share]
    path = /mnt/samba
    browsable =yes
    writable = no
    guest ok = yes
    read only = yes
```

选项的含义如下：

| 配置项               | 作用                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| [samba]和[public]    | 登录时将使用的共享名称。                                               |
| path                 | 分享的路径。                                                           |
| browseable           | 是否应在可用共享列表中列出该共享。通过设置为no，其他用户将看不到共享。 |
| read only            | valid users列表中指定的用户是否能够写入此共享。                        |
| force create mode    | 设置此共享中新创建文件的权限。                                         |
| force directory mode | 设置此共享中新创建目录的权限。                                         |
| valid users          | 允许访问共享的用户和组的列表。群组以@符号为前缀。                      |

完成后，使用以下方法重新启动Samba服务：

```bash
sudo systemctl restart nmbd.service
```

## 连接samba共享

### 从Linux连接到Samba共享

Linux用户可以使用文件管理器从命令行访问samba共享或挂载Samba共享。

#### 使用smbclient客户端

`smbclient`是允许您从命令行访问`Samba`的工具。 `smbclient`软件包尚未预先安装在大多数Linux发行版中，因此您需要使用分发软件包管理器进行安装。

```bash
sudo apt install smbclient
```

```bash
sudo yum install samba-client
```

访问Samba共享的语法如下：

```bash
smbclient //"<windows_computername>/<windows_sharename>" -U "<windows_username>%<windows_password>"
```

您将登录Samba命令行界面。

```bash
Try "help" to get a list of possible commands.
smb: \>
```

#### 挂载Samba共享

要在Linux上挂载 Samba 共享，您需要安装`cifs-utils`软件包。

{% tabs TabName %}
<!-- tab CentOS -->

```bash
sudo yum install cifs-utils
```

<!-- endtab -->


<!-- tab Ubuntu -->

```bash
sudo apt install cifs-utils
```

<!-- endtab -->
{% endtabs %}


接下来，创建安装点：

```bash
sudo mkdir /mnt/smbmount
```

{% tabs TabName %}
<!-- tab 手动挂载 -->

```bash
# uid和gid是挂载到本地的权限。除了有远程服务器权限外，本地也要有权限才能修改。
sudo mount -t cifs //192.168.1.11/0/ /mnt -o vers=2.0,uid=0,gid=0,dir_mode=0755,file_mode=0755,mfsymlinks,cache=strict,rsize=1048576,wsize=1048576,username=iuxt,password=password
```

<!-- endtab -->


<!-- tab fstab自动挂载 -->

```conf
//<windows_computername>/<windows_sharename> /mnt/windows_share cifs username=<windows_username>,password=<windows_password>,iocharset=utf8 0 0
```

<!-- endtab -->
{% endtabs %}


### 从Windows连接到Samba共享

Windows用户还可以选择从命令行和GUI连接到Samba共享。以下步骤显示了如何使用Windows File Explorer访问共享。

打开文件资源管理器，然后在地址栏中以以下格式输入Samba共享的地址\\samba_hostname_or_server_ip\sharename。回车，将提示您输入登录凭据  
如果需要挂载，则在资源管理器中找到`映射网络驱动器`,按照提示输入地址和用户名密码即可挂载成一个盘符。

> 注意： 如果修改过smb服务器配置或权限，windows用户可能需要重新连接一下samba：
> 查看已经创建的连接
>
> ```bat
> C:\Users\iuxt>net use
> 会记录新的网络连接。
> 
> 状态       本地        远程                      网络
> -------------------------------------------------------------------------------
> OK                     \\10.0.0.132\ubuntu       Microsoft Windows Network
> 已断开连接             \\192.168.2.113\users     Microsoft Windows Network
> 命令成功完成。
> ```
>
> 删除现有的连接
>
> ```bat
> net use /delete \\10.0.0.132\ubuntu
> ```
>
> 然后重新连接
>