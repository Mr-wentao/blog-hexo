---
title: Nginx之server_name匹配和listen匹配
abbrlink: 09a38e37
categories:
  - devops
tags:
  - Nginx
  - 配置文件
date: 2022-03-30 10:14:39
---

nginx可以通过listen的ip和端口来匹配请求应该由哪个配置文件来处理，也可以通过server_name来匹配，抽空理了理这个匹配的规则和优先级，参考文档：

## 基于域名的虚拟主机

默认是先匹配listen的ip和端口，匹配到了再检查server_name，如果没有匹配的server_name，则由第一个来处理，除非添加default_server

```conf
server {
    listen      80;
    server_name example.net;
    default_type application/json;
    return 200 '{"server_name":"$server_name", "host": "$host", "server_addr":"$server_addr"}';
}

server {
    listen      80;
    server_name example.com;
    default_type application/json;
    return 200 '{"server_name":"$server_name", "host": "$host", "server_addr":"$server_addr"}';
}
```

测试一下：

```bash
> curl 10.0.0.100 -H "host:example.com"
{"server_name":"example.com", "host": "10.0.0.100", "server_addr":"10.0.0.100"}

> curl localhost
{"server_name":"example.net", "host": "localhost", "server_addr":"127.0.0.1"}
```

在这个配置中，nginx仅仅检查请求的“Host”头以决定该请求应由哪个虚拟主机来处理。如果Host头没有匹配任意一个虚拟主机，或者请求中根本没有包含Host头，那nginx会将请求分发到定义在此端口上的默认虚拟主机。在以上配置中，第一个被列出的虚拟主机即nginx的默认虚拟主机——这是nginx的默认行为。而且，可以显式地设置某个主机为默认虚拟主机，即在"listen"指令中设置"default_server"参数：

如果同样的listen配置了两个 default_server 则会报错`nginx: [emerg] a duplicate default server for 10.0.0.100:80 in /etc/nginx/conf.d/test.conf:9`

## 基于域名和IP混合的虚拟主机

Nginx首先选定由哪一个虚拟主机来处理请求。让我们从一个简单的配置（其中全部2个虚拟主机都在端口*：80上监听）开始：

```conf
server {
    listen      localhost:80;
    server_name example.org;
    default_type application/json;
    return 200 '{"server_name":"$server_name", "host": "$host", "server_addr":"$server_addr"}';
}

server {
    listen      10.0.0.100:80;
    server_name example.net;
    default_type application/json;
    return 200 '{"server_name":"$server_name", "host": "$host", "server_addr":"$server_addr"}';
}

server {
    listen      10.0.0.100:80;
    server_name example.com;
    default_type application/json;
    return 200 '{"server_name":"$server_name", "host": "$host", "server_addr":"$server_addr"}';
}
```

这个配置中，nginx首先测试请求的IP地址和端口是否匹配某个server配置块中的listen指令配置。接着nginx继续测试请求的Host头是否匹配这个server块中的某个server_name的值。如果主机名没有找到，nginx将把这个请求交给默认虚拟主机处理。

例如，一个从10.0.0.100:80端口收到的访问a.example.com的请求将被监听10.0.0.100:80端口的默认虚拟主机处理，本例中就是第二个服务器，因为这个端口上没有定义名为a.example.com的虚拟主机。

我们可以测试一下：

```bash
> curl localhost
{"server_name":"example.org", "host": "localhost", "server_addr":"127.0.0.1"}

> curl 10.0.0.100
{"server_name":"example.net", "host": "10.0.0.100", "server_addr":"10.0.0.100"}

> curl 10.0.0.100 -H "host:example.com"
{"server_name":"example.com", "host": "example.com", "server_addr":"10.0.0.100"}

> curl 10.0.0.100 -H "host:a.example.com"
{"server_name":"example.net", "host": "a.example.com", "server_addr":"10.0.0.100"}
```

## server_name为空

看一个例子，如果不允许请求中缺少“Host”头，可以定义如下主机，丢弃这些请求：

```conf
server {
    listen       80;
    server_name  "";
    return       444;
}
```
