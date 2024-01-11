---
title: 使用image-syncer来实现容器镜像同步
categories:
  - Kubernetes
tags:
  - 镜像
  - 同步
  - 容器
abbrlink: le5lzctq
date: 2023-02-15 19:47:31
---

`image-syncer` 是一个docker镜像同步工具，可用来进行多对多的镜像仓库同步，支持目前绝大多数主流的docker镜像仓库服务

- 支持多对多镜像仓库同步
- 支持基于Docker Registry V2搭建的docker镜像仓库服务 (如 Docker Hub、 Quay、 阿里云镜像服务ACR、 Harbor等)
- 同步只经过内存和网络，不依赖磁盘存储，同步速度快
- 增量同步, 通过对同步过的镜像blob信息落盘，不重复同步已同步的镜像
- 并发同步，可以通过配置文件调整并发数
- 自动重试失败的同步任务，可以解决大部分镜像同步中的网络抖动问题
- 不依赖docker以及其他程序

image-syncer 的官方地址是：<https://github.com/AliyunContainerService/image-syncer>, 是golang开发的， 官方没有给打包成windows版， 所以windows和mac用户需要自己编译一下。

## 编译

### 安装golang环境

略

### 开始构建

```bat
go build main.go
```

会在当前目录下生成main.exe, 重命名为image-syncer.exe

## 使用方法

由于我们需求是进行单镜像同步，所以用不到image-syncer的仓库同步功能，仓库同步配置注释在了配置文件中。

### 账号密码配置： auth.json

```json
{
    "harbor.uat.dftccloud.t.home": {
        "username": "dk",
        "password": "xxxxxxxx",
        "insecure": true
    },
    "harbor.ingeek.com": {
        "username": "admin",
        "password": "xxxxxxxx",
        "insecure": false
    }
}
```

- 仓库名支持 "registry" 和 "registry/namespace"（v1.0.3之后的版本） 的形式，需要跟下面images中的registry(registry/namespace)对应  ,images中被匹配到的的url会使用对应账号密码进行镜像同步, 优先匹配 "registry/namespace" 的形式
- "username": "xxx",               // 用户名，可选，（v1.3.1 之后支持）valuse 使用 "`${env}`" 或者 "$env" 类型的字符串可以引用环境变量
- "password": "xxxxxxxxx",         // 密码，可选，（v1.3.1 之后支持）valuse 使用 "${env}" 或者 "$env" 类型的字符串可以引用环境变量
- "insecure": true                 // registry是否是http服务，如果是，insecure 字段需要为true，默认是false，可选，支持这个选项需要image-syncer版本 > v1.0.1

### 镜像配置  image.json

```json
{
"harbor.ingeek.com/idp/idp-dkm:release2.1_18caf17_202302151719":"harbor.uat.dftccloud.t.home/dk/idp-dkm"
}
```

```txt
同步镜像规则字段，其中条规则包括一个源仓库（键）和一个目标仓库（值）
同步的最大单位是仓库（repo），不支持通过一条规则同步整个namespace以及registry
源仓库和目标仓库的格式与docker pull/push命令使用的镜像url类似（registry/namespace/repository:tag）
源仓库和目标仓库（如果目标仓库不为空字符串）都至少包含registry/namespace/repository
源仓库字段不能为空，如果需要将一个源仓库同步到多个目标仓库需要配置多条规则
目标仓库名可以和源仓库名不同（tag也可以不同），此时同步功能类似于：docker pull + docker tag + docker push

"quay.io/coreos/kube-rbac-proxy": "quay.io/ruohe/kube-rbac-proxy",
"xxxx":"xxxxx",
"xxx/xxx/xx:tag1,tag2,tag3":"xxx/xxx/xx"

当源仓库字段中不包含tag时，表示将该仓库所有tag同步到目标仓库，此时目标仓库不能包含tag
当源仓库字段中包含tag时，表示只同步源仓库中的一个tag到目标仓库，如果目标仓库中不包含tag，则默认使用源tag
源仓库字段中的tag可以同时包含多个（比如"a/b/c:1,2,3"），tag之间通过","隔开，此时目标仓库不能包含tag，并且默认使用原来的tag
当目标仓库为空字符串时，会将源镜像同步到默认registry的默认namespace下，并且repo以及tag与源仓库相同，默认registry和默认namespace可以通过命令行参数以及环境变量配置，参考下面的描述
```

### 同步命令

```bat
image-syncer.exe --proc=6 --auth=auth.json --images=image.json --retries=3
```
