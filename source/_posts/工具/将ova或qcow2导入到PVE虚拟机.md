---
title: 将ova或qcow2导入到PVE虚拟机
categories:
  - 工具
tags:
  - 虚拟化
  - 数据迁移
  - 配置记录
  - proxmox
abbrlink: lphwqhtr
cover: 'https://static.zahui.fan/images/202312011531317.png'
date: 2023-11-28 13:38:33
---
![Proxmox_logo_standard_hex_2000px-768x116.png](https://static.zahui.fan/images/202312011531317.png)

比如我们从VMware Workstation导出的虚拟机镜像(ova或者ovf), 如果我想要导入到proxmox中, proxmox默认是不支持导入OVA虚拟机的, 可以通过转换虚拟机虚拟磁盘的方法将虚拟磁盘附加到现有的pve虚拟机中.

## 提取vmdk虚拟磁盘文件

这一步如果是ova, 则需要用解压缩软件解压一下, 如果是ovf, 直接就能看到vmdk文件

## 转换虚拟磁盘文件

使用工具 qemu-img 进行转换, 如果是导入到pve, 可以不转换, 使用qm命令会自动转换的.

```bash
# 从另一台PVE导出qcow2可以这样
qemu-img convert -p -O qcow2 -c /dev/mapper/pve-vm--110--disk--0 VM110.qcow2

# 从vmdk文件转换可以这样 -c 是压缩
qemu-img convert -c -f vmdk myvm-disk1.vmdk -O qcow2 myvm-disk1.qcow2
```

## 在PVE上创建新的虚拟机

此步骤需要记录一下虚拟机的ID

## 上传虚拟磁盘文件到PVE

pve本质上就是debian linux, 你可以用任何方便的方式上传, 比如在机器上使用wget下载, 或者scp sftp rz等上传

## 使用qm importdisk命令导入

```bash
qm importdisk  <vmid> <images-name> <storage pool>  --format=<disk-fs> 
vmid：vm的id 例如102
images-name：磁盘镜像的名字
storage pool: 存储磁盘镜像的位置，如lvm-thin local
disk-fs: 磁盘镜像格式  raw/vmdk/qcow2
```

导入成功后, 在虚拟机界面可以看到一个未使用磁盘

![image.png](https://static.zahui.fan/images/202311281414540.png)

双击未使用磁盘, 点击添加即可

最后调整一下启动项顺序.
