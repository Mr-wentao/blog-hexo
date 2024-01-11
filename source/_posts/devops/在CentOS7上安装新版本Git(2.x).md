---
title: 在CentOS7上安装新版本Git(2.x)
abbrlink: 5a398dc9
categories:
  - devops
tags:
  - git
  - 配置记录
date: 2022-06-05 21:17:10
---

> centos7 的默认源里面的git版本是1.8.3, 比较老了, 对于有些操作会提示git版本太低, 可以使用第三方源的方式来安装新版本的git

## 使用Wandisco源

创建仓库文件

```bash
cat > /etc/yum.repos.d/wandisco-git.repo <<-'EOF'
[wandisco-git]
name=Wandisco GIT Repository
baseurl=http://opensource.wandisco.com/centos/7/git/$basearch/
enabled=1
gpgcheck=1
gpgkey=http://opensource.wandisco.com/RPM-GPG-KEY-WANdisco
EOF
```

## 安装git

```bash
sudo yum install git
```

## 查看版本

```bash
git version
```

## 离线安装(手动安装rpm)

下载两个文件到本地

```bash
wget https://file.babudiu.com/f/Njsj/perl-Git-2.31.1-1.WANdisco.1657096008.noarch.rpm
wget https://file.babudiu.com/f/Ootv/git-2.31.1-1.WANdisco.1657096008.x86_64.rpm
```

安装

```bash
yum install ./*.rpm
```
