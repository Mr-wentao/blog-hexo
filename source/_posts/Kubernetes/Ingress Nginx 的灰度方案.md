---
title: Ingress Nginx 的灰度方案
abbrlink: c86b58e3
categories:
  - Kubernetes
cover: 'https://s3.babudiu.com/iuxt//images/202211212221065.svg'
tags:
  - ingress
  - nginx
date: 2022-06-09 11:14:02
---

在k8s环境下进行灰度，ingress-nginx自带了灰度注解， 这篇文章挺详细的<https://v2-1.docs.kubesphere.io/docs/zh-CN/quick-start/ingress-canary/>

## 再此之前

有个需求， 根据请求header有没有特定的值，来判断是否进入灰度环境。当时的做法是在集群内用nginx

```conf
# 如果有个header叫gray
if ($http_gray = "true") {
    proxy_pass http://nginx.test1:80;
    break;
}
```

这种方式可以实现需求， 不过不灵活， 也不优雅， 搜了一下， 发现ingress nginx原生提供了灰度的方案

## ingress自带canary部署

简单来说就是部署了两套环境， 这两套一模一样， 只是在不同的namespace（同一个namespace需要取不同的名字），service和ingress域名都配置成一样的， 然后在canary环境的ingress上添加注解即可。

```yml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: canary
  namespace: test1
  annotations:
    kubernetes.io/ingress.class: nginx
    # 优先顺序 canary-by-header - > canary-by-cookie - > canary-weight
    # 这里必须加这条，表示当前ingress是灰度的ingress
    nginx.ingress.kubernetes.io/canary: "true"
    # 这里的值可以改成任意值, 和后面的请求header对应
    nginx.ingress.kubernetes.io/canary-by-header: gray
    # 该规则允许用户自定义 Request Header 的值, 不加的话，默认就是always和never两个值, 表示始终进灰度或不进入灰度。
    # nginx.ingress.kubernetes.io/canary-by-header-value: "true"
    # 只加权重可以实现 权重控制流量
    nginx.ingress.kubernetes.io/canary-weight: "50"
```

## 如何测试效果

可以使用echo server来做测试容器， 请求它可以输出一些基本信息， 我们就知道访问到哪个pod了

[测试过程](/posts/635c073a)
