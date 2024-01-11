---
title: 使用Fail2ban抵御暴力破解和cc攻击
categories:
  - devops
tags:
  - fail2ban
  - cc攻击
  - iptables
abbrlink: c0880a78
cover: 'https://static.zahui.fan/images/202301161323588.png'
date: 2023-01-16 11:08:46
---

fail2ban 是一款防止暴力破解和cc攻击的开源工具，采用Python编写。

## 常用组件

| 工具            | 作用         |
| --------------- | ------------ |
| fail2ban-client | 客户端工具   |
| fail2ban-regex  | 验证正则匹配 |

```bash
# 查看启用的规则
fail2ban-client status

# 查看规则详情
fail2ban-client status sshd

# 重新加载配置
fail2ban-client reload

# 手动解禁IP
fail2ban-client set sshd unbanip 192.168.1.1
```

| 配置文件目录           | 作用                                      |
| ---------------------- | ----------------------------------------- |
| /etc/fail2ban/jail.d   | ban的规则，如多少次触发，触发后封禁多久等 |
| /etc/fail2ban/filter.d | 过滤规则，匹配日志的正则配置              |

## 规则测试

创建配置文件`/etc/fail2ban/jail.d/nginx-cc.conf`

```ini
[nginx-cc]
enabled = true
port = http,https
filter = nginx-cc
action = %(action_mwl)s
maxretry = 20
findtime = 10
bantime = 86400
logpath = /var/log/nginx/access.log
```

> enabled ：是否开启检测
> port：检查的端口
> ignoreip : 忽略不 IP 地址（CIDR 格式）或机器名，以空格分隔。
> bantime : 主机被禁止时长，默认 600 秒。
> maxretry : 在 findtime 时间窗口中，允许主机认证失败次数。达到最大次数，主机将被禁止。
> findtime : 查找主机认证失败的时间窗口。 不意味 着每隔 findtime 时间扫描一次日志。
> 高版本 Fail2ban 支持 s （秒）, m （分）和 d （天）作为时间单位，如 10m 和 1d
> logpath: 扫描的日志文件，fail2ban按行扫描此文件，根据filter规则匹配失败的项目并统计

创建配置文件`/etc/fail2ban/filter.d/nginx-cc.conf`

```ini
[Definition]
failregex = <HOST> -.*- .*HTTP/1.* .* .*$
ignoreregex =
```

### fail2ban-regex 测试

```bash
# 正则规则检查
fail2ban-regex /var/log/nginx/access.log "<HOST> -.*- .*HTTP/1.* .* .*$"

# 根据配置文件检查
fail2ban-regex /var/log/nginx/access.log /etc/fail2ban/filter.d/nginx-cc.conf
```
