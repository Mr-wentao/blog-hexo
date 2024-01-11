---
title: Windows下运行服务的几种方式
categories:
  - Windows
tags:
  - 服务
  - service
abbrlink: 5d4cbfad
date: 2023-01-04 13:56:47
---

## 原生命令sc

微软官方文档： <https://learn.microsoft.com/zh-cn/windows-server/administration/windows-commands/sc-create>

## 第三方工具winsw 2.x

<https://github.com/winsw/winsw/releases/tag/v2.11.0>

需要将winsw可执行文件和配置文件放在同一目录, 一般放在程序同级目录. 同样以frpc为例:

service.xml

```xml
<service>
  
  <id>frpc</id>
  <!-- Display name of the service -->
  <name>frpc Service (powered by WinSW)</name>
  <!-- Service description -->
  <description>frpc 开源内网穿透工具</description>
  
  <!-- Path to the executable, which should be started -->
  <executable>%BASE%\frpc.exe</executable>

  <serviceaccount>
    <domain>.</domain>
    <user>your windows user</user>
    <password>your windows password</password>
    <allowservicelogon>true</allowservicelogon>
  </serviceaccount>

  <onfailure action="restart" delay="10 sec"/>
  <onfailure action="restart" delay="20 sec"/>
  <onfailure action="restart" delay="60 sec"/> 
  
  <resetfailure>4 hour</resetfailure>
 
  <arguments>--config %BASE%\frpc.ini</arguments>

  <priority>Normal</priority>
  <stoptimeout>15 sec</stoptimeout>
  <stopparentprocessfirst>true</stopparentprocessfirst>
    <startmode>Automatic</startmode>
    <delayedAutoStart/>
    <waithint>15 sec</waithint>
    <sleeptime>1 sec</sleeptime>

  <logpath>%BASE%\logs</logpath>
  <log mode="append">
    <!--
    <setting1/>
    <setting2/>
  -->
  </log>

</service>
```

然后将winsw.exe重命名成service.exe(和xml文件保持一致),然后执行

```bat
service.exe install
```

### 其他命令

```bat
service.exe -h
service.exe uninstall
service.exe start
service.exe stop
service.exe restart
```

## 第三方工具winsw 3.x beta

<https://github.com/winsw/winsw>

注意: 2.x 版本 和 3.x 版本会有一些不同, 我用的是 3.x beta 版本, 以 frpc 这个内网穿透服务为例, 3.x 当前指定用户执行的功能有bug

### 安装winsw

确保可执行文件所在的目录在系统环境变量`PATH`中

### 准备配置文件

在可执行文件下保存一份配置文件`winsw.xml`

```xml
<service>
  <id>frpc</id>
  <name>frpc Service (powered by WinSW)</name>
  <description>内网穿透服务</description>

  <executable>%BASE%\frpc.exe</executable>
  <arguments>--config %BASE%\frpc.ini</arguments>
  <workingdirectory>%BASE%</workingdirectory>


  <onfailure action="restart" delay="10 sec"/>
  <onfailure action="restart" delay="20 sec"/>
  <onfailure action="restart" delay="1 hour"/>
  <resetfailure>2 hour</resetfailure>
  <stoptimeout>15 sec</stoptimeout>

  <priority>Normal</priority>
  <startmode>Automatic</startmode>
  <delayedAutoStart>true</delayedAutoStart>
  
  <logpath>%BASE%\logs</logpath>
  <log mode="append">
    <!--
    <setting1/>
    <setting2/>
  -->
  </log>
</service>
```

### 服务操作

```bat
查看帮助
winsw.exe -h

安装服务
winsw.exe install winsw.xml

重启服务, 当然到系统的服务里面重启也可以
winsw.exe restart winsw.xml

修改了xml配置文件, 重新加载
winsw.exe refresh winsw.xml

卸载服务
winsw.exe uninstall winsw.xml
```

## 第三方工具nssm

官网: <https://nssm.cc/download>

下载好可执行文件, 建议放在系统环境变量PATH中, 这样在任何地方都可以执行`nssm`命令

### 常用操作

```bat
安装服务, 会弹出图形界面, 完全界面操作.
nssm install frpc

修改服务
nssm edit frpc

卸载服务
nssm remove frpc
```
