---
title: 阿里云ACK中Nginx ingress使用CLB上的Https证书
categories:
  - Kubernetes
tags:
  - Nginx
  - ingress
  - Kubernetes
  - 阿里云
  - ACK
abbrlink: lr01lzch
cover: 'https://s3.babudiu.com/iuxt//images/202401051130624.png'
date: 2024-01-05 10:54:34
---

背景: 我们在客户那里部署了一套服务, 服务运行在客户提供的ACK集群, 我们删除了客户ACK自带的nginx ingress, 通过自建的方式部署了两套ingress, 一套绑定了公网CLB, 一套绑定了内网CLB, 也就是说是CLB转发到ingress, 然后通过ingress转发到其他服务. 现在需要配置Https证书, 客户不同意我们配置证书到ingress, 客户将证书放在了CLB上, 给了一个证书ID

## 查询阿里云文档

阿里云的文档还是很详细, 通过google查询到文档地址: [通过Annotation配置传统型负载均衡CLB](https://help.aliyun.com/zh/ack/ack-managed-and-ack-dedicated/user-guide/add-annotations-to-the-yaml-file-of-a-service-to-configure-clb-instances)

具体可以查看这里

![image.png](https://s3.babudiu.com/iuxt//images/202401051108111.png)

HTTPS请求会在CLB层解密，然后以HTTP请求的形式发送给后端的Pod。


## 配置LoadBalancer类型的Service

因为我们的CLB是只给ingress使用, 所以修改ingress的Service配置yaml:

```yml
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-force-override-listeners: 'true'
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-id: lb-<负载均衡ID>

    # 新增了下面两行
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-protocol-port: "https:443,http:80"
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-cert-id: "<证书的ID>"
  labels:
    app.kubernetes.io/component: public-controller
    app.kubernetes.io/instance: public-ingress-nginx
    app.kubernetes.io/name: public-ingress-nginx
    app.kubernetes.io/part-of: public-ingress-nginx
    app.kubernetes.io/version: 1.6.4
  name: public-ingress-nginx-controller
  namespace: nginx-ingress
spec:
  ipFamilies:
  - IPv4
  ipFamilyPolicy: SingleStack
  ports:
  - appProtocol: http
    name: http
    port: 80
    protocol: TCP
    targetPort: http
    nodePort: 31080
  - appProtocol: https
    name: https
    port: 443
    protocol: TCP
    nodePort: 31443
    targetPort: https
  selector:
    app.kubernetes.io/component: public-controller
    app.kubernetes.io/instance: public-ingress-nginx
    app.kubernetes.io/name: public-ingress-nginx
  type: LoadBalancer
```

## 遇到的问题

照着上面步骤配置了以后, Https访问证书是生效了, 但是没法转发到后端, 会报错: `The plain HTTP request was sent to HTTPS port`

![image.png](https://s3.babudiu.com/iuxt//images/202401051117258.png)

### 原因分析:
简单画个图

![image.png](https://s3.babudiu.com/iuxt//images/202401051118447.png)

这里https请求在CLB解密后, 请求后面的Ingress是用http协议来请求的, 按道理是所有请求都到pod的80才对, 但是作为用户访问的域名是https, https默认的端口是443, 这样就会造成CLB是使用HTTP协议来请求ingress的HTTPS端口, 所以造成了上面的结果.

## 解决方案

解决方法其实很简单, 只需要将service的443端口也转发到pod的80端口即可. 对应的yaml文件:

```yml
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-force-override-listeners: 'true'
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-id: lb-<负载均衡ID>
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-protocol-port: "https:443,http:80"
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-cert-id: "<证书的ID>"
  labels:
    app.kubernetes.io/component: public-controller
    app.kubernetes.io/instance: public-ingress-nginx
    app.kubernetes.io/name: public-ingress-nginx
    app.kubernetes.io/part-of: public-ingress-nginx
    app.kubernetes.io/version: 1.6.4
  name: public-ingress-nginx-controller
  namespace: nginx-ingress
spec:
  ipFamilies:
  - IPv4
  ipFamilyPolicy: SingleStack
  ports:
  - appProtocol: http
    name: http
    port: 80
    protocol: TCP
    targetPort: http
    nodePort: 31080
  - appProtocol: https
    name: https
    port: 443
    protocol: TCP
    nodePort: 31443
    # 这里把https改成http即可
-   targetPort: https
+   targetPort: http
  selector:
    app.kubernetes.io/component: public-controller
    app.kubernetes.io/instance: public-ingress-nginx
    app.kubernetes.io/name: public-ingress-nginx
  type: LoadBalancer
```

把这里的 `targetPort: https` 改成 `targetPort: http` 即可. 

