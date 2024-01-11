---
title: 使用s6-Overlay来管理多进程容器
abbrlink: ea811085
categories:
  - Kubernetes
tags:
  - Container
  - Crontab
date: 2021-12-30 18:21:43
---

容器使用最佳实践是：一个容器运行一个进程，进程退出容器也就退出，很优雅是不是？但是...在日常工作中总有一些你懂的的原因，就需要多个进程塞在一个容器里面，那么我们可以怎么来管理容器内进程呢？这个时候容器内的进程管理工具就派上用场了。s6-Overlay就是其中之一  
s6-Overlay官方github地址：<https://github.com/just-containers/s6-overlay>

## 安装

容器是通过判断pid=1的进程来判断容器是否工作正常的，也就是说s6-Overlay进程pid为1

通过官方安装脚本来安装

```dockerfile
FROM ubuntu
ADD https://github.com/just-containers/s6-overlay/releases/download/v2.2.0.1/s6-overlay-amd64-installer /tmp/
RUN chmod +x /tmp/s6-overlay-amd64-installer && /tmp/s6-overlay-amd64-installer /
RUN apt-get update && \
    apt-get install -y nginx && \
    echo "daemon off;" >> /etc/nginx/nginx.conf
ENTRYPOINT ["/init"]
CMD ["nginx"]
```

这样即可生效，当nginx挂掉的时候，容器一样会退出的。

## 配置服务

首先主服务，可以这么理解，这个服务挂掉了，整个容器就没有存在的意义了，这个服务应该写在CMD里面，这样遵循容器规范。

辅助服务，应该放在/etc/service.d/里面，以项目名做区分。

文件结构如下：

```tree
root@2ae83d42ee34:/etc/services.d# tree
.
|-- testapp
|   |-- finish
|   `-- run
`-- testapp2
    |-- finish
    `-- run
```

其中run和finish都是可执行文件（bash或python或二进制等），容器启动会运行run程序，如果run意外退出则会运行finish，并且会被自动拉起。整个过程容器不会退出。

### 举个栗子

- 容器里面运行crontab  

一般的容器镜像都没有crontab，首先安装crontab

```bash
yum install crontabs
```

然后容器里面编写服务启动脚本run

```bash
#!/bin/bash
crond -f
```

服务结束脚本finish

```bash
#!/bin/bash
exit 0
```

这样就可以在容器里面运行crontab了

## 其他

瞎扯一句，如果有一个程序不提供前台运行的选项，只能后台运行，那么在容器中也可以这么做

写一个`entrypoint.sh`

```bash
/usr/sbin/sshd && /bin/bash
```

容器的CMD执行`entrypoint.sh`即可不退出，但是问题是sshd退出了容器也不会退出。
