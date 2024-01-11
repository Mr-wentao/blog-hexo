---
title: harbor接入外部trivy镜像漏洞扫描
categories:
  - 基础运维
tags:
  - harbor
  - 镜像
  - 容器
  - 漏洞扫描
abbrlink: 8b932a1b
cover: 'https://static.zahui.fan/images/202305181012814.jpg'
date: 2023-05-12 15:55:43
---


harbor接入trivy漏洞扫描, 用到的开源工具[harbor-scanner-trivy](https://github.com/aquasecurity/harbor-scanner-trivy)

## 安装

需要依赖Redis, 先安装Redis

### 安装trivy

trivy是扫描核心组件， 需要安装，参考trivy官网安装文档

<https://aquasecurity.github.io/trivy/v0.41/getting-started/installation/>

```bash
RELEASE_VERSION=$(grep -Po '(?<=VERSION_ID=")[0-9]' /etc/os-release)
cat << EOF | sudo tee -a /etc/yum.repos.d/trivy.repo
[trivy]
name=Trivy repository
baseurl=https://aquasecurity.github.io/trivy-repo/rpm/releases/$RELEASE_VERSION/\$basearch/
gpgcheck=1
enabled=1
gpgkey=https://aquasecurity.github.io/trivy-repo/rpm/public.key
EOF
sudo yum -y install trivy
```

trivy首次运行会从github下载漏洞数据库，需要确保机器可以连接GitHub，执行`trivy image --download-db-only`会下载db，db数据存储在`~/.cache/trivy`

### 安装scanner-trivy

开源地址：<https://github.com/aquasecurity/harbor-scanner-trivy>

scanner-trivy 是通过环境变量读取配置

启动命令：

```bash
SCANNER_API_SERVER_ADDR=:8181 SCANNER_REDIS_URL=redis://localhost:6379 ./scanner-trivy
```

或者通过supervisor运行

```bash
[program:trivy]
numprocs=1
user=root
command=/data/server/trivy/scanner-trivy
directory=/data/server/trivy/
redirect_stderr=true
stdout_logfile=/data/logs/trivy.log
autostart=true
autorestart=true
startsecs=10
environment=SCANNER_API_SERVER_ADDR=:8181,SCANNER_REDIS_URL=redis://localhost:6379
```

## 使用

harbor 系统管理 审查服务 扫描器 里面添加trivy地址：

![trivy扫描器](https://static.zahui.fan/images/202305121619236.png)

然后就可以正常扫描镜像了

![扫描结果](https://static.zahui.fan/images/202305121624912.png)
