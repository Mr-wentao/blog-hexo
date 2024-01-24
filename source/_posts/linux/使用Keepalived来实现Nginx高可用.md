---
title: 使用Keepalived来实现Nginx高可用
abbrlink: 0cebb8ae
categories:
  - devops
tags:
  - keepalived
  - nginx
  - HA
  - 配置记录
  - Crontab
date: 2022-06-15 17:33:51
---

公有云不会考虑这些，不过自建机房，使用nginx做入口，keepalived是唯一的选择。

| 节点         | IP            |
| ------------ | ------------- |
| keepalived主 | 192.168.13.45 |
| keepalived备 | 192.168.13.44 |
| vip          | 192.168.13.46 |

## keepalived主节点配置

{% tabs TabName %}

<!-- tab 单播模式 -->

```conf
global_defs {
    script_user root            # 脚本执行者
    enable_script_security      # 标记脚本安全
}

vrrp_script check_script {
    script "killall -0 nginx"          # 脚本路径, 返回值为0则正常，不为0认为不正常
    interval 2                              # 脚本执行间隔，单位s
    weight -20                              # -254-254之间，检测失败权重减少, 要大于集群  最大 priority - 最小 priority
}

vrrp_instance VI_1 {                        # 实例名
    state MASTER                            # 当前keepalived状态
    interface eth0
    virtual_router_id 251                   # 组播ID主备需一致，单播无所谓
    priority 100                            # 默认权重
    advert_int 1                            # 发送VRRP通告间隔，单位s
    # nopreempt                             # 设置非抢占模式，原本高优先级的MASER恢复之后，不会去抢现在是低优先级BACKUP, 这项配置只有在两台都配置为state backup才有用。

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456 
    }
    track_script {
        check_script                        # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到keepalived-BACKUP上
    }
    unicast_src_ip 192.168.13.45            # 配置源地址的IP地址
    unicast_peer {
       192.168.13.44                         # 配置从节点的目标IP地址
    }
    virtual_ipaddress {
        192.168.13.46                       # vip
    }
}
```

<!-- endtab -->

<!-- tab 组播模式 -->

```conf
global_defs {
    script_user root            # 脚本执行者
    enable_script_security      # 标记脚本安全
}

vrrp_script check_script {
    script "killall -0 nginx"          # 脚本路径, 返回值为0则正常，不为0认为不正常
    # 可替代的命令:
    # /usr/sbin/pidof nginx             这个命令不推荐, 多个进程pid会出问题
    # pgrep nginx                       类似于pidof nginx 返回的是pid
    interval 2                              # 脚本执行间隔，单位s
    weight -20                              # -254-254之间，检测失败权重减少
}

vrrp_instance VI_1 {                        # 实例名
    state MASTER                            # 当前keepalived状态
    interface eth0
    virtual_router_id 251                   # 组播ID主备需一致，单播无所谓
    priority 100                            # 默认权重
    advert_int 1                            # 发送VRRP通告间隔，单位s
    # nopreempt                             # 设置非抢占模式，原本高优先级的MASER恢复之后，不会去抢现在是低优先级BACKUP, 这项配置只有在两台都配置为state backup才有用。

    authentication {
        auth_type PASS                      # 主备验证信息，需一致
        auth_pass 123456 
    }
    track_script {
        check_script                        # 调用脚本,若脚本最后的执行结果是非0的，则判断端口down掉，此时vip会漂移到keepalived-BACKUP上
    }
    virtual_ipaddress {
        192.168.13.46                       # vip
    }
}
```

<!-- endtab -->
{% endtabs %}

## keepalived备节点配置

{% tabs TabName %}

<!-- tab 单播模式 -->

```conf
global_defs {
    script_user root
    enable_script_security
}

vrrp_script check_script {
    script "killall -0 nginx"
    interval 2
    weight -20
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 251
    priority 99
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 123456
    }
    track_script {
        check_script
    }
    unicast_src_ip 192.168.13.44
    unicast_peer {
       192.168.13.45
    }
    virtual_ipaddress {
        192.168.13.46
    }
}
```

<!-- endtab -->

<!-- tab 组播模式 -->

```conf
global_defs {
    script_user root
    enable_script_security
}

vrrp_script check_script {
    script "killall -0 nginx"
    interval 2
    weight -20
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 251
    priority 99
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 123456
    }
    track_script {
        check_script
    }
    virtual_ipaddress {
        192.168.13.46
    }
}
```

<!-- endtab -->
{% endtabs %}


## 两台Nginx同步配置文件

使用crontab定时每5分钟执行脚本：

```bash
#!/bin/bash
set -ueo pipefail

NGINX_CONF_LOCATION="/usr/local/nginx/conf/"
BACKUP_SERVER="root@192.168.13.44"

# 这里是执行rsync同步配置文件，然后打印结果中的第二行（如果有更新的文件，第二行不为空）
rsync_result=$(rsync -av --delete ${NGINX_CONF_LOCATION} ${BACKUP_SERVER}:${NGINX_CONF_LOCATION} | sed -n "2p")
if [ -z ${rsync_result} ];then
  echo "the configuration file has not changed"
else
  echo "changed nginx config, reload Backup Nginx"
  ssh ${BACKUP_SERVER} "sudo /usr/local/nginx/sbin/nginx -s reload"
fi
```
