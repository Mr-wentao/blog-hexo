---
title: Jenkins pipeline中正确使用git
categories:
  - linux
tags:
  - jenkins
  - 配置记录
abbrlink: lm8t2usn
date: 2023-09-07 14:47:08
---

看到很多jenkins使用都是直接执行git clone命令, 这么做有以下几个缺点.
1. 需要耗费时间去处理git分支, 代码冲突等工作, 还需要判断是使用 git clone 还是 git pull
2. 账号密码(或者ssh秘钥)需要存储在构建机器上, 如果更换了构建节点, 那么需要重新配置, 即对构建环境有依赖, 构建环境是个黑盒子, 因为你不知道上个维护者在这台构建机器上做了什么.
3. 不受jenkins管理, 比如删除流水线, 拉取的代码任然存在机器上
4. 做个分支选项框是个痛苦的事情
将代码交给jenkins管理则省去了这些操作.
## 使用凭据管理账号密码
在 系统管理 -- 凭据 -- 系统 -- 全局凭据 里面增加一个新的凭据


![凭据](https://s3.babudiu.com/iuxt//images/202309071447808.png)
成功后记录一下ID

## 编写流水线

```pipeline
pipeline {
    agent any
    parameters {
      gitParameter branch: '', branchFilter: '.*', defaultValue: '', name: 'BRANCH', quickFilterEnabled: true, selectedValue: 'NONE', sortMode: 'NONE', tagFilter: '*', type: 'GitParameterDefinition'
    }

    stages {
        stage('Hello') {
            steps {
                git branch: "${BRANCH}".split('/')[-1], credentialsId: 'test', url: 'https://gitlab.vrzbq.com/devops/auppus_wfe.git'
                sh 'ls -al'
                sh 'git log'
            }
        }
    }
}

```
branch不支持origin/master这种格式, 所以需要用split处理一下
## 如何生成流水线
![](https://s3.babudiu.com/iuxt//images/202309071527237.png)