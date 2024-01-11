---
title: 使用tailscale打通内网
categories:
  - 工具
tags:
  - 网络
abbrlink: loz4xrye
cover: 'https://static.zahui.fan/images/202311151021732.png'
date: 2023-11-15 10:20:32
---

家里有一台群晖nas, 通过quickconnect连接太慢了, 并且有些操作不能通过quickconnect, 比如直接smb挂载目录
## 群晖nas安装

群晖国内应用商店已经下架了这个APP, 你可以尝试着在应用中心搜索tailscale, 如果可以搜索到, 就直接安装即可. 搜索不到的话, 可以使用离线安装的方式:
![image.png](https://static.zahui.fan/images/202311151015762.png)

到官网下载离线SPK包:
https://pkgs.tailscale.com/stable/#spks
根据你的系统架构来下载包, intel cpu 下载x86_64架构的包. 然后进入群晖软件中心, 点击手动安装, 上传spk包安装

第一次打开tailscale 需要登录, 登录页面不支持quickconnect远程连接, 所以建议在家配置好tailscale

## windows安装

安装成功后， 右键任务栏图标，点击login登录tailscale账号

![image.png](https://static.zahui.fan/images/202311141320528.png)

登录成功后，可以在官网<https://login.tailscale.com/admin/machines> 查看到所有的设备和IP地址等信息。

## 访问方式

tailscale可以使用ip地址来访问，或者使用tailscale的dns域名，比如
![image.png](https://static.zahui.fan/images/202311141324348.png)

建议给常用设备设置 `Disable key expiry` 防止登录过期.

我可以使用mac-mini来访问我的其中一台机而不用记住IP地址。

![image.png](https://static.zahui.fan/images/202311141324477.png)