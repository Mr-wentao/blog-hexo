---
title: 使用 docker buildx 构建不同平台的镜像
abbrlink: ffacccf0
categories:
  - Kubernetes
tags:
  - Container
  - Docker
cover: 'https://s3.babudiu.com/iuxt//images/202211011524478.png'
date: 2021-09-29 16:51:31
---

> 一直使用oracle提供的免费arm云服务器，自己的pc又是x86架构，x86构建出来的镜像不能在arm平台使用

使用buildx可以生成跨平台镜像，跨平台镜像就是同一个镜像名称，同一个tag，但是arm机器和amd64机器拉下来的镜像hash是不一样的

## 创建docker buildx构建环境

> 这里的driver有两种，一种是docker-container，一种是docker，构建多平台版本只能使用docker-container, --use是将切换为默认

```bash
docker buildx create --use --name buildx --node buildx --driver-opt network=host
```

## 准备qemu模拟器

构建不通架构的镜像是通过qemu来模拟的，你会发现构建过程中，和build机器同架构的会构建很快，不同架构构建很慢。

```bash
# 安装全部模拟器
docker run --privileged --rm tonistiigi/binfmt --install all

# 安装指定的模拟器
docker run --privileged --rm tonistiigi/binfmt --install arm64,riscv64,arm

# 卸载指定模拟器
docker run --privileged --rm tonistiigi/binfmt --uninstall qemu-aarch64
```

## buildx构建镜像

准备一个简单的Dockerfile

```dockerfile
FROM ubuntu
CMD ["uname", "-i"]
```

```bash
docker buildx build --push \
    --tag iuxt/ubuntu:latest \
    --platform linux/amd64,linux/arm64 .
```

这个时候登录dockerhub查看

![docker镜像](https://s3.babudiu.com/iuxt//images/20220518103637.png)
可以看到已经是多平台支持了。

```bash
docker run --rm iuxt/test

> x86_64
```

正常构建的时候，也需要考虑到不同的架构区别，在构建命令里面做判断，比如

**Dockerfile**

```dockerfile
FROM ubuntu:latest
ADD build.sh /
RUN /build.sh

ENV REDIS_ADDR=127.0.0.1:6379
ENV REDIS_PASSWORD=111111

CMD /redis_exporter -redis.addr ${REDIS_ADDR} -redis.password ${REDIS_PASSWORD}
```

**build.sh**

```bash
apt update && apt install curl -y && apt clean all
cd /tmp/ 

case $(uname -i) in
x86_64)
    filename="redis_exporter-v1.37.0.linux-amd64.tar.gz"
    bin="redis_exporter-v1.37.0.linux-amd64/redis_exporter"
    ;;
aarch64)
    filename="redis_exporter-v1.37.0.linux-arm64.tar.gz"
    bin="redis_exporter-v1.37.0.linux-arm64/redis_exporter"
    ;;
*)
    echo "don't support $(uname -i)"
    ;;
esac

curl -OL https://github.com/oliver006/redis_exporter/releases/download/v1.37.0/$filename
tar xf $filename && mv $bin /
rm -rf /tmp/*
```

## docker buildx 常用命令

```bash
# 查看所有的builder列表
docker buildx ls

# 删除创建的builder
docker buildx rm mybuilder

# 切换默认builder
docker buildx use mybuilder
```
