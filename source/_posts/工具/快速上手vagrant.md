---
title: 快速上手vagrant
abbrlink: ca1596c5
categories:
  - 工具
tags:
  - vagrant
  - VirtualMachine
date: 2021-11-01 21:36:46
---

> `vagrant`是一个虚拟机管理工具(虚拟机编排工具)，使用方式有点类似于`docker-compose`，这个工具的优势就是可以把手动安装虚拟机这个操作转换成通过代码来控制虚拟机  
> 有点类似于使用`dockerfile`来构建docker镜像的感觉。

## 常用命令

| 命令                     | 作用                        |
| ------------------------ | --------------------------- |
| vagrant init             | 生成vagrantfile文件         |
| vagrant up               | 启动虚拟机                  |
| vagent halt              | 关闭虚拟机                  |
| vagrant box list         | 查看安装的box（虚拟机镜像） |
| vagrant box add centos/7 | 安装box（虚拟机镜像）       |
| vagrant ssh (hostname)   | 通过ssh连接                 |

## 常用vagrantfile

### 批量创建虚拟机

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :

servers = {
    :client => '172.16.2.10',
    :master1 => '172.16.2.11',
    :master2 => '172.16.2.12',
    :master3 => '172.16.2.13',
    :worker1 => '172.16.2.21',
    :worker2 => '172.16.2.22'
}

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"
  config.vm.box_check_update = false

  # 自动插入hosts
  # vagrant plugin install vagrant-hostmanager
  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true
  config.hostmanager.manage_guest = true
  config.hostmanager.ignore_private_ip = false
  config.hostmanager.include_offline = true

  servers.each do |server_name, server_ip|
    config.vm.define server_name do |server_config|
      server_config.vm.hostname = "#{server_name.to_s}"
      server_config.vm.network :private_network, ip: server_ip
      server_config.vm.provider "virtualbox" do |vb|
        vb.name = server_name.to_s
        vb.memory = "4096"
        vb.cpus = 4
      end
    end
  end
end
```

### 循环创建虚拟机

```ruby
Vagrant.configure("2") do |config|

  (1..3).each do |i|
    config.vm.define "node#{i}" do |node|
      node.vm.box = "ubuntu/trusty64"
      node.vm.hostname="node#{i}"
      node.vm.network "private_network", ip: "192.168.59.#{i}"
      node.vm.provider "virtualbox" do |v|
        v.name = "node#{i}"
        v.memory = 2048
        v.cpus = 1
      end
                  
      node.vm.provision "shell", inline: <<-SHELL
        wget -qO- https://get.docker.com/ | sed 's/docker-engine/docker-engine=1.11.0-0~trusty/' | sh
        usermod -aG docker vagrant
      SHELL
    end
  end
end
```

### 多次定义安装虚拟机

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.define "master" do |master|
    master.vm.box = "centos/7"
    master.vm.provider "virtualbox"
    master.vm.network "private_network", ip: "10.10.0.10"
    master.vm.synced_folder "/home/iuxt/code/nutstore-system-deployment/configuration/puppet/modules", "/etc/puppetlabs/code/modules",create: true,owner: "root", group: "root",mount_options:["dmode=775","fmode=644"]
    master.vm.synced_folder "/home/iuxt/code/nutstore-system-deployment/configuration/puppet/environments/production/manifests", "/etc/puppetlabs/code/environments/production/manifests",create: true,owner: "root", group: "root",mount_options:["dmode=775","fmode=644"]
    master.vm.hostname = "puppet-master"
    master.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "4096"
      vb.cpus = "2"
    end
    master.vm.provision "shell", inline: <<-SHELL
       sudo rpm -Uvh https://yum.puppet.com/puppet6-release-el-7.noarch.rpm
       yum install puppetserver -y
       echo "127.0.0.1 puppet" >> /etc/hosts
    SHELL
  end

  config.vm.define "agent" do |agent|
    agent.vm.box = "centos/7"
    agent.vm.provider "virtualbox"
    agent.vm.network "private_network", ip: "10.10.0.11"
    agent.vm.hostname = "puppet-agent"
    agent.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "4096"
      vb.cpus = "2"
    end
    agent.vm.provision "shell", inline: <<-SHELL
       sudo rpm -Uvh https://yum.puppet.com/puppet6-release-el-7.noarch.rpm
       yum install puppet -y
       echo "10.0.0.10 puppet" >> /etc/hosts
    SHELL
  end
end

```

## 常用插件

### 自动管理hosts

> 插件官网：<https://github.com/devopsgroup-io/vagrant-hostmanager>

安装插件

```bash
vagrant plugin install vagrant-hostmanager
```

启用

```ruby
Vagrant.configure("2") do |config|
  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true
  config.hostmanager.manage_guest = true
  config.hostmanager.ignore_private_ip = false
  config.hostmanager.include_offline = true
  config.vm.define 'example-box' do |node|
    node.vm.hostname = 'example-box-hostname'
    node.vm.network :private_network, ip: '192.168.42.42'
    node.hostmanager.aliases = %w(example-box.localdomain example-box-alias)
  end
end
```

### 挂载本机目录到虚拟机

```ruby
Vagrant.configure("2") do |config|
    config.vm.define "master" do |master|
    master.vm.box = "centos/7"
    master.vm.provider "virtualbox"
    master.vm.network "private_network", ip: "10.10.0.10"
    master.vm.synced_folder "/home/iuxt/code/nutstore-system-deployment/configuration/puppet/modules", "/etc/puppetlabs/code/modules",create: true,owner: "root", group: "root",mount_options:["dmode=775","fmode=644"]
```

> 这里可能会提示：`mount: unknown filesystem type 'vboxsf'`，这是因为虚拟机没有自带`vbox guest agent`, 以前的centos是vagrant自己打包的，都是带vbox guest agent的，但是现在vagrant下载centos的box的时候会重定向到centos官网，这个box是不带vbox guest agent的，解决办法有以下：  
>
> 1. 更换镜像为`generic/centos7`, 镜像官网：<https://roboxes.org/>
> 2. 自己安装好再重新打包box  
> 3. 安装`vagrant plugin install vagrant-vbguest`，这个插件可以自动挂载iso，然后安装。  
> 4. 更换增加`type`参数，使用nfs或smb来和虚拟机共享，需要主机安装nfs或smb服务。
