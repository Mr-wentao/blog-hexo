---
title: Kubernetes 绑定Hosts的正确姿势
abbrlink: 23f11af0
cover: 'https://s3.babudiu.com/iuxt//images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - k8s
  - Container
  - Docker
date: 2022-04-12 11:06:50
---

有的时候我们需要在容器里面绑定hosts，比如我们用logstash需要消费kafka消息，但是kafka监听的地址是hostname，这个时候就需要绑定hosts（规范一点是做解析）  
在容器里面绑定hosts常见的方法一种是挂载主机的hosts文件，一种是修改容器的启动CMD，每次启动修改hosts，这两种方法都有个缺点，就是不受kubelet管理了，默认的hosts内容也会被覆盖掉  
在k8s环境下有更好的解决方案：那就是让k8s自己来管理

## 使用hostAliases来绑定hosts

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: logstash-k8s
  namespace: ops
spec:
  replicas: 1
  selector:
    matchLabels:
      app: logstash-k8s
  template:
    metadata:
      labels:
        app: logstash-k8s
    spec:
      hostAliases:
      - ip: "192.168.13.127"
        hostnames:
        - "elk"
      - ip: "192.168.13.128"
        hostnames:
        - "elk2"
      - ip: "192.168.13.129"
        hostnames:
        - "elk3"
```

## 进入容器查看hosts文件

```bash
kubectl exec -n ops logstash-k8s-68d6bf4dff-sxnst -- cat /etc/hosts
```

```conf
# Kubernetes-managed hosts file.
127.0.0.1    localhost
::1    localhost ip6-localhost ip6-loopback
fe00::0    ip6-localnet
fe00::0    ip6-mcastprefix
fe00::1    ip6-allnodes
fe00::2    ip6-allrouters
172.20.16.108    logstash-k8s-68d6bf4dff-sxnst

# Entries added by HostAliases.
192.168.13.127    elk
192.168.13.128    elk2
192.168.13.129    elk3
```

这个hosts包括两个部分，一部分是容器自带的hosts，另一部分是我们自己添加的

## 在docker下绑定hosts

### 运行时候修改

docker可以通过 --add-host 参数来添加hosts信息到容器的/etc/hosts文件中

```bash
docker run --rm --add-host=example.com:192.168.1.2 ubuntu cat /etc/hosts
```

```conf
127.0.0.1    localhost
::1    localhost ip6-localhost ip6-loopback
fe00::0    ip6-localnet
ff00::0    ip6-mcastprefix
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters
192.168.1.2    example.com
172.17.0.2    eece89ee8fc7
```

### 构建时修改

Dockerfile中，可以在CMD命令下进行修改，在RUN里面修改会提示文件只读无法修改。

```Dockerfile
FROM centos:7
CMD echo "111" >> /etc/hosts && \
    echo "Hosts: " && \
    cat /etc/hosts
```

## 在docker-compose环境下绑定hosts

在yml文件里

```yml
extra_hosts:
 - "test.com:192.168.1.1"
 - "example.com:192.168.1.2"
```

显示出来的效果/etc/hosts

```text
192.168.1.1  test.com
192.168.1.2  example.com
```
