---
title: Docker常用配置
abbrlink: 4bc23141
categories:
  - Kubernetes
tags:
  - Container
  - 配置记录
  - Docker
cover: 'https://static.zahui.fan/images/202211011524478.png'
date: 2021-02-19 12:14:59
---

## docker 安装

### 官方安装脚本

```bash
curl -fsSL get.docker.com | bash
```

### 阿里云安装（centos）

```bash
# step 1: 安装必要的一些系统工具
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# Step 2: 添加软件源信息
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# Step 3: 更新并安装Docker-CE
sudo yum makecache fast
sudo yum -y install docker-ce

# Step 4: 开启Docker服务
sudo systemctl start docker.service

```

### docker-compose 安装

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose && sudo chmod +x /usr/bin/docker-compose
```

## 免root执行docker命令

```bash
sudo usermod -aG docker $USER
```

> 顺便确定一下sock文件有没有权限（默认是有的）, 退出账户重新登录一下即可生效

## 阿里云Docker加速

```bash
mkdir -p /etc/docker && tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
```

或者

```bash
cat > /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
```

## 常用操作

### 一次性删除所有的容器

```bash
docker rm -f `docker ps -aq`
```

### 一次性删除所有的镜像

```bash
docker rmi $(docker image ls | awk 'NR!=1 {print $1 ":" $2}')
```

### 一次性删除未打标签的镜像

```bash
docker image ls | grep none | awk '{print $3}' | xargs docker rmi
```

### 一次性删除所有volume

```bash
docker volume rm `docker volume ls -q`
```

### Docker进入容器

```bash
docker run --name test_ubuntu -it ubuntu /bin/bash
启动一个容器并打开shell
```

### 查看容器详情

```bash
# 重看容器详情
docker inspect 容器id或名字

# 重看docker详情
docker info
```

### 启动容器

```bash
docker run -it 镜像名字 /bin/sh
```

### 进入一个运行中的容器

```bash
docker exec -it 容器id /bin/sh
```

### 打tag

```bash
docker tag 镜像id oldboy1103/alpine:latest
```

### 查看容器占用磁盘空间

```bash
docker ps -a --format "table {{.Size}}\t{{.Names}}" | sort -hr
```

### 查看容器id

```bash
docker inspect nginx --format "{{.ID}}"
```

### 查看日志文件

```bash
# 查看nginx容器的日志位置
docker inspect nginx --format "{{.LogPath}}"

# 查看所有容器的日志位置
docker inspect --format='{{.LogPath}}' `docker ps -a -q`
```


```bash
# 获取镜像，ID，端口号，状态
docker ps -a --format "table {{.Image}}\t{{.ID}}\t{{.Ports}}\t{{.Status}}" | sort -hr

# 根据状态列出容器
docker ps -a -f  "status=running"
docker ps -a -f  "status=exited"

# 获取容器的IP
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q)

# 获取容器的mac地址
docker inspect --format='{{range .NetworkSettings.Networks}}{{.MacAddress}}{{end}}' $(docker ps -a -q)

# 获取容器name
docker inspect --format='{{.Name}}' $(docker ps -aq)
docker inspect --format='{{.Name}}' $(docker ps -aq)|cut -d"/" -f2

# 获取容器的Hostname
docker inspect --format '{{ .Config.Hostname }}' $(docker ps -q)

# 获取hostname,ip
docker inspect --format 'Hostname:{{ .Config.Hostname }}  Name:{{.Name}} IP:{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q)

# 获取容器的镜像
docker inspect --format='{{.Config.Image}}' `docker ps -a -q`
```
## 容器备份还原

### 镜像的备份还原

1. commit将容器保存成镜像

    ```bash
    docker commit [选项] <容器ID或容器名> [<仓库名>[:<标签>]]
    ```

2. 将镜像导出成tar (镜像是分层的,可以回滚,)

    ```bash
    docker save -o ./backup.tar gitlab/gitlab-ce
    ```

3. 从tar导入镜像（镜像备份下来的tar）

    ```bash
    docker load -i ./backup.tar
    ```

> 注意：以上会备份镜像的多层。

### 容器的备份还原

1. 备份容器

    ```bash
    docker export php > phprongqi.tar
    ```

2. 还原成镜像

    ```bash
    docker import ./phprongqi.tar php
    ```

> 注意：备份的只是一层镜像

## 容器的日志

### 日志位置

docker日志建议输出控制台，控制台日志存储在主机上

先查看`Logging Driver`类型，默认应该是`json`格式

```bash
docker info | grep "Logging Driver"
```

json格式的日志在`/var/lib/docker/containers/<containerID>/<containerID>-json.log`
local格式的日志在`/var/lib/docker/containers/<containerID>/local-logs/container.log`

### 控制日志大小

vi /etc/docker/daemon.json

```json
{ 
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m", "max-file": "3"
    }
}
```

