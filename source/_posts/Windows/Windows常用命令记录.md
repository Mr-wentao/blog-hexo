---
title: Windows常用命令记录
abbrlink: 801c62c9
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - Windows
  - 配置记录
date: 2021-03-10 19:04:51
---

## smb操作

### 挂载smb

```bat
net use z: \\192.168.10.163\share "<密码>" /user:"<计算机名\用户名>"
```

### 卸载smb

```bat
net use z: /del /y
```

## 写入剪切板

从文件写入

```bat
clip < C:\Users\iuxt\.ssh\id_rsa.pub
```

直接写入

```bat
echo 222 | clip
```

## 用户操作

### 启用Administrator

```bat
net user administrator Office@2015 /active:yes
```

### 新建用户

新建用户IT,密码为123456,密码*为手动输入,不能改密码,密码永不过期

```bat
net user IT 123456 /add /passwordchg:no /expires:never
```

### 将用户加入组

```bat
net localgroup Administrators IT /add
```

### 新建用户组

```bat
net localgroup 组名 /add
```

### 其他命令

| 参数            | 说明           |
| --------------- | -------------- |
| /active:no      | 启用或禁用用户 |
| /comment:"Text" | 用户描述       |

## win + R 速查

| 命令                              | 说明                |
| --------------------------------- | ------------------- |
| certmgr.msc                       | 证书管理            |
| compmgmt.msc                      | 计算机管理          |
| control                           | 控制面板            |
| control userpasswords             | 用户账户            |
| devmgmt.msc                       | 设备管理器          |
| diskmgmt.msc                      | 磁盘管理            |
| eventvwr                          | 事件查看器          |
| explorer                          | 资源管理器          |
| gpedit.msc                        | 组策略编辑器        |
| fsmgmt.msc                        | 共享文件夹          |
| iexplore                          | IE浏览器            |
| lusrmgr.msc                       | 本地用户和组        |
| msconfig                          | 系统配置            |
| mspaint                           | 画图                |
| mstsc                             | 远程桌面连接        |
| osk                               | 屏幕键盘            |
| perfmon.msc                       | 性能监视器          |
| netplwiz                          | 打开账户管理窗口2   |
| control userpasswords2            | 打开账户管理窗口2   |
| rundll32 netplwiz.dll,UsersRunDll | 打开账户管理窗口2   |
| gpmc.msc                          | 域控组策略          |
| taskschd.msc                      | 任务计划程序        |
| ncpa.cpl                          | 控制面板 - 网络管理 |
| systempropertiesprotection        | 系统保护设置页面    |
| sysdm.cpl                                  |        系统属性页面             |
