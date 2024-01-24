---
title: 搭建NFS服务
abbrlink: 4b677f68
categories:
  - linux
tags:
  - 配置记录
  - NFS
date: 2021-11-09 17:40:30
---

> k8s集群需要存储，本地测试环境懒得搞些复杂的，开始回忆回忆入门时学的nfs的搭建，记录下吧，方便查看

## 搭建服务器

{% tabs TabName %}
<!-- tab Ubuntu和Debian -->

```bash
sudo apt install -y nfs-kernel-server
```

<!-- endtab -->
<!-- tab CentOS和Fedora -->

```bash
sudo yum install -y nfs-utils
```

<!-- endtab -->
{% endtabs %}

```bash
# 创建共享目录
sudo mkdir /nfs

# 删除权限限制
sudo chown -R nobody:nogroup /nfs

# RHEL 9 系统
# sudo chown -R nobody:nobody /nfs

# 修改配置文件
echo "/nfs *(rw,sync,no_subtree_check,no_root_squash)" >> /etc/exports

# 使配置生效
sudo exportfs -a
```

重启服务
{% tabs TabName %}
<!-- tab Ubuntu和Debian -->

```bash
sudo systemctl restart nfs-server
sudo systemctl enable nfs-server
```

<!-- endtab -->
<!-- tab CentOS和Fedora -->

```bash
# CentOS 7
sudo systemctl restart nfs
sudo systemctl enable nfs

# RHEL 9
sudo systemctl restart nfs-server
sudo systemctl enable nfs-server
```

<!-- endtab -->
{% endtabs %}

## 搭建客户端

{% tabs TabName %}
<!-- tab Ubuntu和Debian -->

```bash
sudo apt install -y nfs-common
```

<!-- endtab -->
<!-- tab CentOS和Fedora -->

```bash
sudo yum install -y nfs-utils
```

<!-- endtab -->
{% endtabs %}

```bash
# 创建待挂载的目录
mkdir /mnt/nfs

# 挂载
sudo mount 10.0.0.3:/nfs /mnt/nfs

# 修改 /etc/fstab 开机自动挂载
10.0.0.3:/nfs    /mnt/nfs    nfs    defaults    0 0 
```
