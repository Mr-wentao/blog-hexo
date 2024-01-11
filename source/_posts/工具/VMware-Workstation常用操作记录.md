---
title: VMware Workstation常用操作记录
abbrlink: 4bef6e47
cover: 'https://static.zahui.fan/images/202211211238166.png'
categories:
  - 工具
tags:
  - Windows
  - VirtualMachine
date: 2021-04-21 15:49:12
---

## 安装

### 官方下载链接

```bash
https://download3.vmware.com/software/wkst/file/VMware-workstation-full-10.0.7-2844087.exe 

上面的版本不支持64位Windows系统 
https://download3.vmware.com/software/wkst/file/VMware-workstation-full-12.0.0-2985596.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-12.5.4-5192485.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-12.5.5-5234757.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-12.5.9-7535481.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.0.0-6661328.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.0-7370693.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.1-7528167.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.2-8497320.exe http://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.3-9474260.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.4-10722678.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.5-10950780.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.6-12368378.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.7-12989993.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-14.1.8-14921873.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.0.0-10134415.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.0.1-10737736.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.0.2-10952284.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.0.3-12422535.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.0.4-12990004.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.1.0-13591040.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.5.0-14665864.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.5.1-15018445.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.5.2-15785246.exe 

上面的版本不能和hyper-v（包括wsl2）共存 
https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.5.5-16285975.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.5.6-16341506.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-15.5.7-17171714.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-16.0.0-16894299.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-16.1.0-17198959.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-16.1.1-17801498.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-16.1.2-17966106.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-16.2.0-18760230.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-16.2.1-18811642.exe https://download3.vmware.com/software/wkst/file/VMware-workstation-full-16.2.2-19200509.exe 
https://download3.vmware.com/software/WKST-1623-WIN-New/VMware-workstation-full-16.2.3-19376536.exe 
https://download3.vmware.com/software/WKST-1624-WIN/VMware-workstation-full-16.2.4-20089737.exe 
https://download3.vmware.com/software/WKST-1625-WIN/VMware-workstation-full-16.2.5-20904516.exe 
https://download3.vmware.com/software/WKST-1625-WIN/VMware-workstation-full-16.2.5-20904516.exe 
https://download3.vmware.com/software/WKST-1700-WIN/VMware-workstation-full-17.0.0-20800274.exe 
https://download3.vmware.com/software/WKST-1701-WIN/VMware-workstation-full-17.0.1-21139696.exe 
https://download3.vmware.com/software/WKST-1702-WIN/VMware-workstation-full-17.0.2-21581411.exe 
https://download3.vmware.com/software/WKST-1750-WIN/VMware-workstation-full-17.5.0-22583795.exe
```

### 序列号

| 版本 | 批量激活序列号                |
| ---- | ----------------------------- |
| 10.x | 1Z0G9-67285-FZG78-ZL3Q2-234JG |
| 11.x | YG74R-86G1M-M8DLP-XEQNT-XAHW2 |
| 12.x | ZC3TK-63GE6-481JY-WWW5T-Z7ATA |
| 14.x | AU108-FLF9P-H8EJZ-7XMQ9-XG0U8 |
| 15.x | FC7D0-D1YDL-M8DXZ-CYPZE-P2AY6 |
| 16.x | ZF3R0-FHED2-M80TY-8QYGC-NPKYF |
| 17.x | VG7TK-AZX8N-0888Y-PYQ7E-MKRW8 |

[最新版下载地址](https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html)

### ubuntu安装依赖

Ubuntu下面安装VMWare，提示：Build environment error! A required application is missing and Modconfig can not

```bash
sudo apt-get install gcc libcanberra*
```

## 减小导出ova的体积

> 导出OVF模板之前压缩会大幅度缩小OVF的体积

### 压缩linux虚拟机磁盘

```bash
sudo -E sh -c 'cat /dev/zero > zero;sync;sleep 1;sync;rm -f zero && vmware-toolbox-cmd disk shrinkonly && poweroff'
```

### 压缩windows虚拟机磁盘

在虚拟机列表上右键👉🏻️管理👉🏻️清理磁盘

## vmware-vdiskmanager

### 将单个文件vmdk分割成每个不超过2G的多个vmdk文件

```bat
"C:\Program Files (x86)\VMware\VMware Workstation\vmware-vdiskmanager.exe" -r source.vmdk -t 1 split.vmdk
```

### 合并vmdk文件

```bat
"C:\Program Files (x86)\VMware\VMware Workstation\vmware-vdiskmanager.exe" -r split.vmdk -t 0 merged.vmdk
```

> windows虚拟机对文件共享支持比较好，基本上安装上`vmware-tools`就可以正常使用了，不管主机是windows还是linux

## 虚拟机Linux和主机文件共享

虚拟机需要安装`open-vm-tools`

### 使用命令手动挂载

{% tabs TabName %}

<!-- tab 4.0内核以上 -->

```bash
# 将所有共享文件夹挂载到/mnt/hgfs
sudo vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other

# 将名称sharedfolder的共享挂载到/mnt/hgfs
sudo /usr/bin/vmhgfs-fuse .host:/sharedfolder /mnt/hgfs -o subtype=vmhgfs-fuse,allow_other 
```

> 可以用`vmhgfs-fuse -h`查看命令可用的所有参数。挂载点可以自己设置，不一定要放在默认目录。

<!-- endtab -->

<!-- tab 4.0内核以下 -->

```bash
# 将所有共享文件夹挂载到/mnt/hgfs
sudo mount -t vmhgfs .host:/ /mnt/hgfs

# 将名称sharedfolder的共享挂载到/mnt/hgfs
sudo mount -t vmhgfs .host:/sharedfolder /mnt/hgfs 
```

<!-- endtab -->
{% endtabs %}

### 使用fstab自动挂载

{% tabs TabName %}

<!-- tab 4.0内核以上 -->

> 在`/etc/fstab`添加一行

```bash
# 默认参数
.host:/ /mnt/hgfs fuse.vmhgfs-fuse allow_other,defaults 0 0

# 修改用户和所有者，修改默认umask为022，默认权限是755
.host:/ /mnt/hgfs/ fuse.vmhgfs-fuse allow_other,uid=1000,gid=1000,umask=022 0 0
```

<!-- endtab -->

<!-- tab 4.0内核以下 -->

> 在`/etc/fstab`添加一行

```bash
.host:/ /mnt/hgfs vmhgfs defaults 0 0
```

<!-- endtab -->
{% endtabs %}
