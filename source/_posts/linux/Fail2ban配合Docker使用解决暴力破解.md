---
title: Fail2ban配合Docker使用解决暴力破解
categories:
  - linux
tags:
  - fail2ban
  - cc攻击
  - iptables
  - docker
abbrlink: 7b28cbbc
cover: 'https://static.zahui.fan/images/202301161323588.png'
date: 2023-01-16 15:50:06
---

fail2ban正常使用可以参考[使用Fail2ban抵御暴力破解和cc攻击](/posts/c0880a78)，但是对于使用了Docker host网络的容器来说是不生效的。原因最后说， 我们先复原一下部署情况

## 环境现状

服务器是我自己的服务器，使用Nginx做入口，反向代理到不同的后端，后端服务和Nginx都是运行在Docker里，使用Docker的自定义网络进行互联。其中Nginx容器使用的是Host网络

## 配置fail2ban

### 确定Docker版Nginx日志路径

Linux内一切皆文件，Docker会将日志写入到主机的一个日志文件中。通过

```bash
docker inspect nginx --format "{{.LogPath}}"
```

可以查看到容器的日志位置

### 创建配置文件`/etc/fail2ban/jail.d/nginx-cc.conf`

```ini
[nginx-cc]
enabled = true
port = http,https
filter = nginx-cc
action = %(action_mwl)s
maxretry = 50
findtime = 10
bantime = 86400
logpath = /var/lib/docker/containers/6fb54f7558d2c7f3c9cb9ce2928f746abd2ce5cd1a3f56fe4889ea3f336b08ff/6fb54f7558d2c7f3c9cb9ce2928f746abd2ce5cd1a3f56fe4889ea3f336b08ff-json.log
```

### 创建配置文件`/etc/fail2ban/filter.d/nginx-cc.conf`

```ini
[Definition]
failregex = ^\{\"log\":\"<HOST> -.*- .*HTTP/1.* .* .*$
ignoreregex =
```

## 复现问题

照此配置后，多次访问后，查看`fail2ban-client status nginx-cc`，此时fail2ban已经显示ip被ban了：

![fail2ban显示](https://static.zahui.fan/images/202301161607539.png)

查看iptables规则：

![iptables](https://static.zahui.fan/images/202301161608061.png)

也已经REJECT了，但是并没有效果。

### 原因分析

![架构图](https://static.zahui.fan/images/202301161608560.png)

原因是fail2ban作用于INPUT链，而Docker Host走的是Forward链。

## 解决方案

在`/etc/fail2ban/jail.d/nginx-cc.conf`里增加一行配置，指定作用于哪个链。

完整配置如下：

```ini
[nginx-cc]
enabled = true
chain = DOCKER-USER
port = http,https
filter = nginx-cc
action = %(action_mwl)s
maxretry = 50
findtime = 10
bantime = 86400
logpath = /var/lib/docker/containers/6fb54f7558d2c7f3c9cb9ce2928f746abd2ce5cd1a3f56fe4889ea3f336b08ff/6fb54f7558d2c7f3c9cb9ce2928f746abd2ce5cd1a3f56fe4889ea3f336b08ff-json.log
```

执行

```bash
fail2ban-client reload
```

重新加载配置。此时发生ban ip，再次查看iptables规则：

![更改后](https://static.zahui.fan/images/202301161632308.png)

已经作用于DOCKER-USER链
