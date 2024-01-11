---
title: 将wsl里的文件挂载进虚拟机
abbrlink: 49e7e3c2
cover: 'https://static.zahui.fan/images/202211211238166.png'
categories:
  - Windows
tags:
  - VirtualMachine
  - WSL
  - Windows
  - Crontab
date: 2021-12-16 19:34:45
---

> 虽然不同操作系统使用起来大致类似，很多开源软件同时支持[Linux](/tags/linux/)和[Windows](/tags/windows/)，就算不支持，Windows还有[cygwin](/tags/cygwin/)或[WSL](/tags/wsl/)，Linux也有wine，但是我感觉这两种系统最大的区别还是文件系统，比如将Linux下的文件复制到Windows，然后再复制回Linux，得到的文件和原来的是一样的吗，答案是否定的，因为文件权限可能已经发生了变化，另外Windows的NTFS大小写不敏感，导致很多时候从Linux复制文件到Windows的时候总会弹个窗问我是否覆盖，还有Linux的软链接也无法复制到Windows里面。  
> 本人平时写代码等都是在linux上运行的，不过最近系统换成了Windows，为了避免以上问题，将文件放进了WSL里面，同时用到了虚拟机做测试，所以想将wsl和虚拟机的目录进行同步，才有了这篇文章。

## 在Windows环境下找到想要共享的目录

> 以下3种都可以

- 在Windows下可以这样访问WSL`\\wsl$\发行版名`，比如`\\wsl$\Ubuntu`，将完整的链接复制下来。
- 将`\wsl$\Ubuntu`映射到一个虚拟盘符，比如Z:，这种方法可以用在比如[vagrant](/tags/vagrant/)上面
~~- 在WSL安装位置找找：比如`C:\Users\iuxt\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState\rootfs\home\iuxt\code\nutstore-system-deployment\configuration\puppet\environments\production\manifests`~~

## 配置虚拟机开启共享文件夹

- VMware Workstation虚拟机

    虚拟机设置 - 选项 - 共享文件夹  填写上一步获取到的路径  
    期间会弹出提示《路径指向网络位置，请确保其在运行虚拟机时可供访问》，忽略即可。

- Virtualbox虚拟机

    虚拟机设置 - 共享文件夹 - 固定分配, 挂载点留空，进系统手动挂载

## 虚拟机里挂载目录

- VMware Workstation虚拟机
    需要先安装`open-vm-tools`，然后编写个脚本`mount_hgfs.sh`：

    ```bash
    #!/bin/bash
    /usr/bin/vmhgfs-fuse .host:/modules /etc/puppetlabs/code/modules -o subtype=vmhgfs-fuse,allow_other
    /usr/bin/vmhgfs-fuse .host:/manifests /etc/puppetlabs/code/environments/production/manifests -o subtype=vmhgfs-fuse,allow_other
    ```

    > allow_other 添加的话，挂载后的目录权限为777，即所有人可读写，不加的话仅root可读写，其他人不可读写。  
    > .host:/xxx  这个是共享名，是在VMware软件界面填写的，可以通过命令`vmware-hgfsclient`查看。  

- Virtualbox虚拟机
    也需要安装virtual guest tools，不过可以使用mount命令挂载，也可以修改fstab自动挂载

    ```conf
    etc_puppetlabs_code_modules /etc/puppetlabs/code/modules vboxsf dmode=775,fmode=644,_netdev,uid=0,gid=0,_netdev 0 0
    etc_puppetlabs_code_environments_production_manifests /etc/puppetlabs/code/environments/production/manifests vboxsf dmode=775,fmode=644,_netdev,uid=0,gid=0,_netdev 0 0
    ```

## 开机自启动挂载

- VMware Workstation虚拟机

    修改root的crontab

    ```bash
    @reboot /root/mount_hgfs.sh
    ```

- Virtualbox虚拟机
    通过fstab来挂载。
