---
title: Kubernetes的3中探针readinessProbe、livenessProbe和startupProbe
cover: 'https://static.zahui.fan/images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - Kubernetes
  - k8s
  - 生命周期
abbrlink: af97998
date: 2023-07-20 16:41:33
---

## 探针

K8S 提供了3种探针

startupProbe    启动检查（1.16版本新增）
livenessProbe   存活检查
readinessProbe  就绪检查

### startupProbe

kubernetes 1.16版本新增功能，用于判断容器内应用程序是否已经启动，如果配置了startuprobe，就会先禁用其他的探测，直到它成功为止，成功后将不再进行探测。

```yml
startupProbe:                     # 健康检查方式：[readinessProbe,livenessProbe,StartupProbe]
  failureThreshold: 3             # 检测失败3次表示未就绪
  httpGet:                        # 请求方式
    path: /health                 # 请求路径
    port: 8080                    # 请求端口
    scheme: HTTP                  # 请求协议
  initialDelaySeconds: 20         # 容器启动后要等待多少秒后存活和就绪探测器才被初始化，默认是 0 秒，最小值是 0。
  periodSeconds: 10               # 执行探测的时间间隔（单位是秒）。默认是 10 秒。最小值是 1。 
  successThreshold: 1             # 探测器在失败后，被视为成功的最小连续成功数。默认值是 1 存活和启动探测的这个值必须是1 最小值是 1
  failureThreshold: 2             # 当探测失败时，Kubernetes 的重试次数。 存活探测情况下的放弃就意味着重新启动容器。 就绪探测情况下的放弃 Pod 会被打上未就绪的标签。默认值是 3。最小值是 1。
  timeoutSeconds: 1               # 探测的超时后等待多少秒。默认值是 1 秒。最小值是 1。
```

### readinessProbe

一般用于探测容器内的程序是否健康，它的返回值如果为success，那么就代表这个容器已经完成启动，并且程序已经是可以接受流量的状态. 这个时候就会被加到service的后端列表中，即可以对外提供服务。

### livenessProbe

用于探测容器是否运行，如果探测失败，kubelet会根据配置的重启策略进行相应的处理，如果没有配置该探针，默认就是success


## 检查方式

### httpget

kubelet 会向容器内运行的服务（服务在监听 8080 端口）发送一个 HTTP GET 请求来执行探测。 如果服务器上 /healthz 路径下的处理程序返回成功代码，则 kubelet 认为容器是健康存活的。 如果处理程序返回失败代码，则 kubelet 会杀死这个容器并将其重启。

返回大于或等于 200 并且小于 400 的任何代码都标示成功，其它返回代码都标示失败。

```yml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
    httpHeaders:
    - name: Custom-Header
      value: Awesome
```

### tcp端口

端口通了则成功，不通则失败

```yml
startupProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 20
  periodSeconds: 5
  successThreshold: 1
  failureThreshold: 3
  timeoutSeconds: 3
```

### 执行命令

如果命令执行成功并且返回值为 0，kubelet 就会认为这个容器是健康存活的。 如果这个命令返回非 0 值，kubelet 会杀死这个容器并重新启动它。

```yml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  timeoutSeconds: 2
  successThreshold: 3
  failureThreshold: 2          # 当探测失败时，Kubernetes 的重试次数。 存活探测情况下的放弃就意味着重新启动容器。 就绪探测情况下的放弃 Pod 会被打上未就绪的标签。默认值是 3。最小值是 1。
  periodSeconds: 5
```