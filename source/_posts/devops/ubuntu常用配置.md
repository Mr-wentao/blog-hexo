---
title: ubuntu常用配置
abbrlink: 27a660e
cover: 'https://static.zahui.fan/images/202308242246912.png'
categories:
  - 基础运维
tags:
  - Linux
  - 配置记录
  - Ubuntu
  - Crontab
date: 2021-02-18 18:35:12
---

## 编译环境安装

```bash
sudo apt-get install -y build-essential tcl gcc make zlib1g-dev libssl-dev libncursesw5-dev libgdbm-dev libc6-dev libffi-dev openssl libxml2-dev libpcre3 libpcre3-dev libncurses5-dev libicu-dev libmcrypt-dev curl libcurl4-gnutls-dev libjpeg-dev libpng-dev libxslt1-dev
```

## 切换语言环境

`dpkg-reconfigure locales`

## Ubuntu 网卡配置文件

### 查看网卡硬件信息

```bash
lshw -short | grep network
ifconfig -a
```

### 网卡配置文件(16版本及以下):/etc/network/interfaces 文件内容如下

```bash
auto eth0
iface eth0 inet static
address 192.168.111.14
gateway 192.168.111.2
netmask 255.255.255.0
dns-nameservers 192.168.111.2

#network 192.168.111.0
#broadcast 192.168.111.255
```

> 注意：如果Ubuntu系统采用的是desktop版，由于desktop版安装了NetworkManager，修改完interfaces文档中的内容后，不会生效。需要先修改/etc/NetworkManager/NetworkManager.conf文档中的managed参数，使之为true ，并重启系统， 然后在修改/etc/network/interfaces文件，设置静态IP。

### 重启网卡使配置生效

```bash
sudo /etc/init.d/networking restart
```

如果上面命令无法令ubuntu重启网络，则使用下面命令：

```bash
sudo ifdown eth0 && sudo ifup eth0
或者

service networking restart
或者

ifconfig eth0 down && ifconfig eth0 up
```

### 网卡配置文件(17.10+):/etc/netplan/01-netcfg.yaml

> ubuntu从17.10开始，已放弃在/etc/network/interfaces里固定IP的配置，而是改成netplan方式，配置写在/etc/netplan/01-netcfg.yaml或者类似名称的yaml文件里

```yml
# This file describes the network interfaces available on your system
# For more information, see netplan(5).
network:
  version: 2
  ethernets:
    ens33:
      addresses: [ 10.0.0.51/24 ]
      gateway4: 10.0.0.2
      nameservers:
          addresses:
              - "10.0.0.2"
```

dhcp配置

```yml
# This file describes the network interfaces available on your system
# For more information, see netplan(5).
network:
  version: 2
  ethernets:
    ens32:
      dhcp4: yes
```

然后执行`netplan apply`使配置生效,不用重启网卡.

### 临时修改网卡DNS地址

```bash
vim /etc/resolv.conf(不建议直接修改)
nameserver 223.5.5.5 #修改成你的主DNS
nameserver 223.6.6.6 #修改成你的备用DNS
search localhost #你的域名
修改后:wq退出，配置会实时生效，但是重启系统后会丢失配置。
```

### 永久修改网卡DNS

```bash
vim /etc/resolvconf/resolv.conf.d/base
添加如下内容

nameserver 8.8.8.8
nameserver 8.8.4.4

刷新DNS使生效

resolvconf -u
```

> resolv.conf文件就是根据/etc/resolvconf/resolv.conf.d目录中的这几个文件生成的。

### 查看现在正在使用的DNS

```bash
systemd-resolve --status
```

### 启动速度慢

等在 `a start job is running for wait for network to be configured` 很久， 可以直接关闭 `systemd-networkd-wait-online` 服务

```bash
sudo systemctl mask systemd-networkd-wait-online.service
```

## 系统配置

### 检查设备加载情况

```bash
dmesg | grep eth
```

### 修改默认编辑器

```bash
sudo update-alternatives --config editor   # 用于 visudo 等
sudo select-editor                         # 用于 crontab -e 等
```

### 安装字体

系统字体位置`/usr/share/fonts/`, 将字体复制到`/usr/share/fonts/`目录
用户字体位置`~/.local/share/fonts`, 将字体复制到`~/.local/share/fonts`目录

~~然后刷新字体缓存， 经测试不刷新也可以生效~~

~~fc-cache -vf~~

## 包管理

### 安装本地包，不处理依赖

```bash
dpkg -i ./xxx.deb
```

### 安装本地包，并自动处理依赖

```bash
apt install ./xxx.deb
```

### 查看一个包有哪些文件组成

```bash
dpkg -L vim
```

### 锁定版本, 不更新

```bash
sudo apt-mark hold kubelet kubeadm kubectl
```

### 查询文件属于哪个包

```bash
apt install -y apt-file
apt-file update
apt-file search libssl.so.1.1
```

### 下载离线包

只下载，不安装

```bash
sudo rm -f /var/cache/apt/archives/*.deb
sudo apt install -d fio

# 下载的deb文件在
/var/cache/apt/archives
```

### 安装指定版本的包

查询源内可用的包版本

```bash
apt-cache madison docker-ce
```

安装指定版本的包

```bash
sudo apt-get install docker-ce=<VERSION_STRING>
```

### 非交互式

```bash
sh -c 'DEBIAN_FRONTEND=noninteractive apt-get install -y -qq apt-transport-https ca-certificates curl >/dev/null'
```

### 不安装推荐的软件包

```bash
apt-get --no-install-recommends 
```

## 图形界面

### 桌面图标配置文件

用户配置文件位置`~/.local/share/applications`
系统配置文件位置: `/usr/share/applications`

```ini
[Desktop Entry]
Name=Visual Studio Code
Comment=Code Editing. Redefined.
GenericName=Text Editor
Exec=/usr/share/code/code --no-sandbox --unity-launch %F
Icon=com.visualstudio.code
Type=Application
StartupNotify=false
StartupWMClass=Code
Categories=Utility;TextEditor;Development;IDE;
MimeType=text/plain;inode/directory;application/x-code-workspace;
Actions=new-empty-window;
Keywords=vscode;

X-Desktop-File-Install-Version=0.24

[Desktop Action new-empty-window]
Name=New Empty Window
Exec=/usr/share/code/code --no-sandbox --new-window %F
Icon=com.visualstudio.code
```
