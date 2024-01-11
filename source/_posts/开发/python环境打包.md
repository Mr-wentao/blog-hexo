---
title: Python环境打包
abbrlink: 15e02d6d
categories:
  - 开发
tags:
  - Python
date: 2021-05-27 19:26:20
---

## 为什么要打包

公司有个远古项目, 用到的是`fabric1.x`, 只支持`python2`版本, 并且对环境要求比较苛刻, 而且代码已经无人维护, 这种情况下将包固定下来, 保证代码可以运行

## 安装pyenv环境

> pyenv官网 <https://github.com/pyenv/pyenv>，pyenv和其他的虚拟环境不同之处在于它可以安装任意版本的python环境（源码编译）  
> 所以需要安装编译python的环境。

```bash
yum install -y git zlib zlib-devel libffi-devel openssl openssl-devel readline-devel bzip2-devel sqlite-devel
curl https://pyenv.run | bash
```

## 创建虚拟环境

> 安装python2.7.18的虚拟环境, 此环境只给fabric用, 所以就没有添加到环境变量, 以免影响其他python程序

```bash
yum install sqlite-devel bzip2-devel readline-devel

/root/.pyenv/bin/pyenv install 2.7.18
```

## 使用虚拟环境安装需要的包

```bash
/root/.pyenv/versions/2.7.18/bin/pip install fabric==1.14.1
```

安装完成后在`/root/.pyenv/versions/2.7.18/bin`看到了fab可执行程序

## 创建软链接

```bash
ln -sf /root/.pyenv/versions/2.7.18/bin/fab /usr/local/bin/fab
```

这样fab的环境就准备好了, 后面只需要把`/root/.pyenv`打包分发给其他机器
其实还可以使用pyinstaller打包, 不过我感觉没啥必要了.
