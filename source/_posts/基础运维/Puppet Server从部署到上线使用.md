---
title: Puppet Server从部署到上线使用
abbrlink: e8243516
categories:
  - 基础运维
tags:
  - Puppet
date: 2021-10-21 17:41:56
---

这是一篇todo文章，可以快速将puppetserver部署起来，经常遇到的坑也会写出来，但是自己不踩吭记忆是没有成长的（不仅仅是收获经验，重要的是增加了学习的能力），如果不缺时间的话，强烈建议看官方文档：<https://puppet.com/docs/puppet/7/server/install_from_packages.html>  

## 安装master

### 通过源来安装

```bash
sudo rpm -Uvh https://yum.puppet.com/puppet7-release-el-8.noarch.rpm
sudo yum install puppetserver
```

### 启动master服务

```bash
sudo systemctl start puppetserver
```

> 如果报错`Found master private key '/etc/puppetlabs/puppet/ssl/private_keys/localhost.localdomain.pem' but master public key '/etc/puppetlabs/puppet/ssl/public...`需要把ssl目录删除`sudo rm -rf /etc/puppetlabs/puppet/ssl/*`（**已经上线的master，请自己考虑后果再决定**），再尝试启动

### 修改dns解析

解析puppet到master的ip即可

> 或者绑定hosts, 如果是hosts，客户端和服务器都需要绑定hosts到master的ip

```txt
10.10.0.10  puppet
```

## 安装puppet-agent

> 安装agnet需要先启用仓库

```bash
sudo rpm -Uvh https://yum.puppet.com/puppet7-release-el-8.noarch.rpm
sudo yum install puppet-agent
```

## anget连接server

### 手动签名认证

```bash
#] puppet agent --test

Info: Creating a new RSA SSL key for agent
Info: csr_attributes file loading from /etc/puppetlabs/puppet/csr_attributes.yaml
Info: Creating a new SSL certificate request for agent
Info: Certificate Request fingerprint (SHA256): A3:CA:C3:B1:69:C9:97:3D:3A:BB:A4:F0:E5:15:34:A5:74:B5:86:08:E1:A9:02:A6:D4:91:12:04:6A:89:76:70
Info: Certificate for agent has not been signed yet
Couldn't fetch certificate from CA server; you might still need to sign this agent's certificate (agent).
Exiting now because the waitforcert setting is set to 0.
```

这时候需要在master节点上面允许agnet的证书，以下是master节点执行：

```bash
# 查看还没签名的证书
puppetserver ca list

# 给所有证书签名
puppetserver ca sign --all
```

### 自动签名认证

自动认证需要编写ACL规则，一个简单的规则如下：

```bash
#] vim /etc/puppetlabs/puppet/autosign.conf

*.nutscloud.com
```

然后重新启动master服务即可

## 部署代码

然后把清单文件(.pp)放到master的`/etc/puppetlabs/code/environments/production/manifests`  
`modules`放到`/etc/puppetlabs/code/modules`

## 其他证书操作

### 吊销证书

如果不想让某个agent来连接master，可以在master上面把证书撤销

```bash
puppetserver ca revoke --certname agent_name
```

### 清理证书

比如说重装了系统，需要master重新生成证书

```bash
puppetserver ca clean --certname agent_name
```
