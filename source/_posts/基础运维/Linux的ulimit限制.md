---
title: Linux的ulimit限制
categories:
  - 基础运维
tags:
  - linux
  - 配置记录
abbrlink: c1a3cdd
date: 2023-06-12 17:57:06
---

## 临时设置

| 命令            | 说明                     |
| --------------- | ------------------------ |
| ulimit -a       | 查看所有限制值           |
| ulimit -n 65535 | 临时调整open files限制值 |

## 永久设置

配置文件:
/etc/security/limits.conf

{% tabs OS %}

<!-- tab Ubuntu和Debian -->

```bash
*               soft    nofile          65535
*               hard    nofile          65535
*               hard    nproc           65535
*               soft    nproc           65535
root            soft    nofile          65535
root            hard    nofile          65535
root            hard    nproc           65535
root            soft    nproc           65535
```

<!-- endtab -->

<!-- tab CentOS和Fedora -->

```bash
*               soft    nofile          65535
*               hard    nofile          65535
*               hard    nproc           65535
*               soft    nproc           65535
```

<!-- endtab -->

{% endtabs %}
