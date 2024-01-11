---
title: Nginx四层反向代理后端记录真实IP
abbrlink: ee4a87b3
categories:
  - 基础运维
tags:
  - proxy
  - 配置记录
date: 2022-06-08 09:58:58
---

使用k8s的ingress暴露服务，会有使用负载均衡反向代理ingress的情况，那么我们的ingress获取到的ip都是4层负载的ip，比如常用架构图
![常用架构](https://static.zahui.fan/images/20220608100711.png)

4层Proxy Protocol透传tcp工作在网络第4层,Proxy Protocol就是在tcp中增加一个小的报头，用来存储额外的信息

代理协议即 Proxy Protocol,是haproxy的作者Willy Tarreau于2010年开发和设计的一个Internet协议，通过为tcp添加一个很小的头信息，来方便的传递客户端信息（协议栈、源IP、目的IP、源端口、目的端口等)，在网络情况复杂又需要获取客户IP时非常有用。
其本质是在三次握手结束后由代理在连接中插入了一个携带了原始连接四元组信息的数据包。

目前 proxy protocol有两个版本，v1仅支持human-readable报头格式（ASCIII码），v2需同时支持human-readable和二进制格式，即需要兼容v1格式
proxy protocol的接收端必须在接收到完整有效的 proxy protocol 头部后才能开始处理连接数据。因此对于服务器的同一个监听端口，不存在兼容带proxy protocol包的连接和不带proxy protocol包的连接。如果服务器接收到的第一个数据包不符合proxy protocol的格式，那么服务器会直接终止连接。

Proxy protocol是比较新的协议，但目前已经有很多软件支持，如haproxy、nginx、apache、squid、mysql等等，要使用proxy protocol需要两个角色sender和receiver,sender在与receiver之间建立连接后，会先发送一个带有客户信息的tcp header,因为更改了tcp协议头，需receiver也支持proxy protocol，否则不能识别tcp包头，导致无法成功建立连接。
nginx是从1.5.12起开始支持的

## 问题所在

通常我们获取真实ip是通过负载均衡获取到远程的地址， 然后生成一个header发送给后端， 这样就可以获取到真实ip了，但是在4层负载里面， 没有header这个概念， ingress又没办法获取到访问4层的地址， 最多只能拿到4层负载的地址， 所以需要在4层上面把远程的ip记录下来， 然后传送到后端也就是ingress

TCP proxy_protocol 的定义其实就是在数据报文最前面加上对应的IP信息。然后最后一个server解开这个data前面的IP信息。

官方文档：<https://nginx.org/en/docs/stream/ngx_stream_realip_module.html>

## 4层负载修改

先用`nginx -V`看下nginx有没有`--with-stream_realip_module`编译参数， 没有的话， 需要记下当前的编译参数，添加`--with-stream_realip_module`后重新编译，替换现有的nginx二进制文件

然后修改配置文件，增加参数

```conf
   upstream k8s-http {
        server 10.0.0.30:80;
    }
    server {
        listen 80;
        proxy_connect_timeout 1s;
        # proxy_timeout 10s;        # 后端连接超时时间
        proxy_protocol on ;         # 增加这个
        proxy_pass k8s-http;
    }
   upstream k8s-https {
        server 10.0.0.30:443;
    }
    server {
        listen 443;
        proxy_connect_timeout 1s;
        # proxy_timeout 10s;        # 后端连接超时时间
        proxy_protocol on ;         # 增加这个
        proxy_pass k8s-https;
    }
```

## 修改ingress（最后一个负载均衡）

这样改了之后， 由于包被修改了，导致后面的ingress无法解析这个包了， 会报错 `400 Bad Request`

需要修改ingress nginx的configmap配置， 如下：

```yml
data:
  use-proxy-protocol: "true"
```

然后ingress就可以获取到真实的ip了。
