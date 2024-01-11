---
title: LVM逻辑卷管理
abbrlink: f4ea28c3
categories:
  - 基础运维
tags:
  - Linux
  - 配置记录
  - Disk
date: 2021-05-11 22:24:43
---


LVM是`Logical Volume Manager`的缩写，中文逻辑卷管理，LVM是建立在磁盘分区和文件系统之间的一个逻辑层，LVM会更加灵活，可以动态扩容缩容分区大小。调整分区大小有风险，请做好充分测试再决定是否执行。  
如果没有启用`lvm`，请查看[linux磁盘扩容 - 非LVM](/33420276/)  
那么怎么知道机器有没有启用LVM呢，可以执行`sudo lvdisplay`查看有没有已存在的LV，对比`df -hT`里面的`Filesystem`，也可以用`lsblk`查看有没有lvm。

## LVM 的一些概念

PV：    物理卷，比如一个分区，一个磁盘
VG：    卷组，将多个PV整合在一起，形成一个大的池子
LV：    逻辑卷，从VG划分出来一个个空间，可以当作分区来看待，可以格式化，可以挂载

### 常用命令

| 查看           | 扩展     | 创建     |
| -------------- | -------- | -------- |
| vgdisplay(vgs) | vgextend | vgcreate |
| lvdisplay(lvs) | lvextend | lvcreate |
| pvdisplay(pvs) | --       | pvcreate |

## 扩容文件系统

### 物理扩容

> 虚拟机扩容就是扩容虚拟磁盘，物理机扩容比如可以增加硬盘。

{% tabs TabName %}

<!-- tab 创建新的PV -->

> 新增硬盘，只能创建新的PV

创建新分区  

```txt
[root@centos7 ~]# fdisk /dev/sdb
Welcome to fdisk (util-linux 2.23.2).

Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table
Building a new DOS disklabel with disk identifier 0x602c2eec.

Command (m for help): n
Partition type:
   p   primary (0 primary, 0 extended, 4 free)
   e   extended
Select (default p): p
Partition number (1-4, default 1):
First sector (2048-20971519, default 2048):
Using default value 2048
Last sector, +sectors or +size{K,M,G} (2048-20971519, default 20971519):
Using default value 20971519
Partition 1 of type Linux and of size 10 GiB is set

Command (m for help): p

Disk /dev/sdb: 10.7 GB, 10737418240 bytes, 20971520 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x602c2eec

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1            2048    20971519    10484736   83  Linux

Command (m for help): t
Selected partition 1
Hex code (type L to list all codes): 8e
Changed type of partition 'Linux' to 'Linux LVM'

Command (m for help): w
The partition table has been altered!

Calling ioctl() to re-read partition table.
Syncing disks.
```

> 这里有个疑问，如果不设置分区ID为`8e`，也不影响后续操作，但是`fdisk -l /dev/sda`的时候，查看到的新分区Type为Linux，而不是Linux LVM，不知道这两种有什么不同，知道的大佬麻烦告诉我一下。。

创建pv

```shell
pvcreate /dev/vdb1
pvdisplay
```

添加PV到VG

```shell
vgextend vg1 /dev/vdb1
```

> 添加完成`sudo vgdisplay`可以看到 `Free PE / Size` 的空间大小

<!-- endtab -->

<!-- tab 扩展现有的PV -->

> 如果虚拟机是通过扩容现有硬盘的方式来扩容，可以扩展现有PV，如果是新增的硬盘，只能新建PV来扩容

安装 cloud-utils

{% subtabs subtabs %}

<!-- tab Debian -->
```bash
sudo apt install cloud-guest-utils
```
<!-- endtab -->

<!-- tab CentOS -->
```bash
sudo yum install cloud-utils-growpart
```
<!-- endtab -->

{% endsubtabs %}

扩容 PV

```bash
growpart /dev/vdb 1
pvs
```
<!-- endtab -->
{% endtabs %}

### 创建或扩展LV

{% tabs TabName %}

<!-- tab 扩展现有的LV -->

```bash
lvextend /dev/mapper/vg1-lv1 /dev/sda4
lvextend -l +100%FREE /dev/mapper/vg1-lv1
lvextend -L +1024M /dev/mapper/vg1-lv1
```

<!-- endtab -->

<!-- tab 创建新的LV -->

```bash
# 创建一个指定大小的lv，并指定名字为lv2
lvcreate -L 2G -n lv2 vg1

# 创建一个占全部卷组大小的lv，并指定名字为lv3
lvcreate -l 100%VG -n lv3 vg1

# 创建一个空闲空间80%大小的lv，并指定名字为lv4
lvcreate -l 80%Free -n lv4 vg1
```

<!-- endtab -->
{% endtabs %}

### 格式化并挂载

> 新创建的`LV`类似于硬盘分区，需要格式化后再挂载

格式化

```bash
mkfs.xfs /dev/mapper/vg1-lv1
```

挂载

{% tabs TabName %}
<!-- tab 手动挂载 -->

```bash
mount /dev/mapper/vg1-lv1 /opt
```

<!-- endtab -->

<!-- tab fstab自动挂载 -->

```bash
/dev/mapper/vg1-lv1 /opt xfs defaults 0 0
```

<!-- endtab -->
{% endtabs %}

### 调整文件系统大小

{% tabs 文件系统大小 %}

<!-- tab ext文件系统 -->

```bash
sudo resize2fs /dev/mapper/vg1-lv1
```

<!-- endtab -->

<!-- tab xfs文件系统 -->

```bash
sudo xfs_growfs /dev/mapper/vg1-lv1
```

<!-- endtab -->

<!-- tab RHEL -->

在早期的RHEL中，由于resize2fs无在线resize功能，故额外提供了ext2online。

```bash
sudo ext2online /dev/mapper/vg1-lv1
```

<!-- endtab -->
{% endtabs %}

## 缩小文件系统

1. 卸载文件系统

    ```bash
    umount /dev/vg_name/lv_name
    ```

2. 检查文件系统是否有错误

    ```bash
    e2fsck -f /dev/vg0/lvm1
    ```

3. 调整文件系统大小

    ```bash
    resize2fs /dev/vg0/lvm1 10G
    ```

4. 调整LV的大小

   ```bash
   lvreduce -L 10G /dev/vg0/lvm1
   ```

5. 重新挂载LV

    ```bash
    mount /dev/vg0/lvm1 /lvm1
    ```

## 移除PV

> 比如某个PV对应的硬盘损坏，需要更换，比如需要更换`/dev/sdb`

1. 查看pv使用情况

    ```bash
    sudo pvdisplay
    ```

    查看对应的PV参数`Allocated PE`，若不为0表示有逻辑卷在使用，需要使用`pvmove /dev/sdb`将数据转移到其他空闲的PV上面

2. 将PV从VG移出

    ```bash
    vgreduce vg_name /dev/sdb
    ```

3. 移除PV

    ```bash
    pvremove /dev/sdb
    ```

4. 更换硬盘，然后重新创建PV，添加VG等
