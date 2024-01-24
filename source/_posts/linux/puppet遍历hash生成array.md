---
title: Puppet遍历hash生成array
abbrlink: bee2f20f
categories:
  - devops
tags:
  - Puppet
date: 2021-07-05 14:26:54
---

> 公司的nagios监控是使用puppet来进行自动部署的，但是需要手动修改puppet配置才能生效，现在的问题是添加一个新机器得先在puppet上添加机器，然后添加到相对应的组，我们想能否让它自动添加到对应的组里面。

vim nagios_server.pp

```ruby
nagios::nagios::add_linux_remote {
        'guangzhou.nutscloud.com' :
        addr     => '10.0.0.9',
        services => [{'name' => 'check_load', 'desc' => 'Current Load', 'notify' => 1},
                     ...
                     {'name' => 'check_zombie_procs', 'desc' => 'Zombie Processes', 'notify' => 1}];
        'tianjin.nutscloud.com' :
        addr     => '10.0.0.90',
        services => [{'name' => 'check_load', 'desc' => 'Current Load', 'notify' => 1},
                     ...
                     {'name' => 'check_zombie_procs', 'desc' => 'Zombie Processes', 'notify' => 1}];
}
...

class { 'nagios::nagios':
        hostgroups => [{'name' => 'supermicro',
                        'alias' => 'Supermicro Machines',
                        'members' => ['guangzhou.nutscloud.com' ... 'yingtan.nutscloud.com']},
                       {'name' => 'windows',
                        'alias' => 'Windows Machines',
                        'members' => ['win2016-dc.nutscloud.com' ... 'win2016-oos8.nutscloud.com']},
                       {'name' => 'vms',
                        'alias' => 'Virtual Machines',
                        'members' => ['tianjin.nutscloud.com' ... 'erdao.nutscloud.com']},
                       {'name' => 'edc',
                        'alias'  => 'edc servers',
                        'members' => ['bjedc1.nutscloud.com' ... 'cdcbjedc3.nutscloud.com']},
                      ]
    }
```

> 通过循环来调用add_linux_remote来创建很多个配置文件。安装nagios（省略）和生成hostgroup.cfg配置文件,这里的列表是手动填上去的。

nagios模块add_linux_remote内容：

```ruby
define nagios::nagios::add_linux_remote (
    $addr='127.0.0.1',
    $port=5666,
    $check_command="check-host-alive",
    $services) {
    file { "/etc/nagios/objects/${name}.cfg":
        ensure     => 'present',
        content    => template('nagios/linux-host.cfg.erb'),
        owner      => 'root',
        group      => 'root',
        mode       => '0664',
        require    => File['/etc/nagios/objects'],
        notify     => Class['nagios::nagios::service'],
    }
}
```

## 修改变量为hash

现在传给add_linux_remote的变量是很多个hash，采用循环的方式，得先让它先成一个hash，才能方便我们进行遍历
添加了一个新的参数hostgroup来判断应该放在哪个分组下。

vim nagios_server.pp

```ruby
monitor_list = {
        'guangzhou.nutscloud.com' => {
        addr     => '10.0.0.9',
        hostgroup => 'supermicro',
        services => [{'name' => 'check_load', 'desc' => 'Current Load', 'notify' => 1},
                     ...
                     {'name' => 'check_zombie_procs', 'desc' => 'Zombie Processes', 'notify' => 1}],
        },
        'tianjin.nutscloud.com' => {
        addr     => '10.0.0.90',
        hostgroup => 'vms',
        services => [{'name' => 'check_load', 'desc' => 'Current Load', 'notify' => 1},
                     ...
                     {'name' => 'check_zombie_procs', 'desc' => 'Zombie Processes', 'notify' => 1}],
        },
}
```

现在这种格式是monitor_list是一个大hash，大hash里面有很多小hash

## 不改变原先模块的工作方式

这里执行add_linux_remote或者add_windows_remote

```ruby
$monitor_list.each |$key, $value| {
        if $value["hostgroup"] =~ /(supermicro|edc|vms)/ {
            nagios::nagios::add_linux_remote { $key:
            addr     => $value["addr"],
            services => $value["services"],
            }
        }
        elsif $value["hostgroup"] =~ /windows/ {
            nagios::nagios::add_windows_remote { $key:
            addr     => $value["addr"],
            services => $value["services"],
            }
        }
    }
```

接下来修改添加hostgroup的部分

```ruby
class { 'nagios::nagios':
        hostgroups => [{'name' => 'supermicro',
                        'alias' => 'Supermicro Machines',
                        'members' => $monitor_list.map |$key, $value| {if $value["hostgroup"] == "supermicro" { $key }}.filter |$items| { $items }},
                       {'name' => 'windows',
                        'alias' => 'Windows Machines',
                        'members' => $monitor_list.map |$key, $value| {if $value["hostgroup"] == "windows" { $key }}.filter |$items| { $items }},
                       {'name' => 'vms',
                        'alias' => 'Virtual Machines',
                        'members' => $monitor_list.map |$key, $value| {if $value["hostgroup"] == "vms" { $key }}.filter |$items| { $items }},
                       {'name' => 'edc',
                        'alias'  => 'edc servers',
                        'members' => $monitor_list.map |$key, $value| {if $value["hostgroup"] == "edc" { $key }}.filter |$items| { $items }},
                      ]
    }
```

> 这里的操作是 先map，通过判断生成array，然后调用filter去掉array里面的空值。
