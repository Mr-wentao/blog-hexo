---
title: 使用keepalived完成LVS高可用
abbrlink: 675d47a9
categories:
  - linux
tags:
  - LoadBalance
  - 配置记录
  - Network
  - HA
  - keepalived
  - lvs
date: 2022-07-29 13:09:47
---

> 有了keepalived可以不用执行ipvsadm了， 并且可以实现自动剔除节点，还可以两台Director做高可用。

手动配置LVS请看[内核级负载均衡 LVS DR模式 部署记录](/posts/5fdc91d7)

另见：[使用Keepalived来实现Nginx高可用](/posts/0cebb8ae)

规划：
| 机器          | IP        |
| ------------- | --------- |
| VIP           | 10.0.0.8  |
| director      | 10.0.0.40 |
| realserver1   | 10.0.0.42 |
| realserver2   | 10.0.0.43 |
| 网卡interface | eth0      |

## 单台Director Server

keepalived 配置：

```txt
vrrp_sync_group GOP {
    group {
        VI_PRI_CONNECT
        VI_PRI_AUTH
    }
}

vrrp_instance VI_PRI_CONNECT {
    state BACKUP
    interface eth0
    virtual_router_id 128
    priority 100
    advert_int 1
    nopreempt
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        10.0.0.8/24 dev eth0
    }
}


virtual_server 10.0.0.8 80 {
    delay_loop 6
    lb_algo rr
    lb_kind DR
    protocol TCP


    real_server 10.0.0.42 80 {
        weight 100
        TCP_CHECK {
                connect_timeout 3
                nb_get_retry 3
                delay_before_retry 3
                connect_port 80
        }
    }
    real_server 10.0.0.43 80 {
        weight 100
        TCP_CHECK {
                connect_timeout 3
                nb_get_retry 3
                delay_before_retry 3
                connect_port 80
        }
    }
}
```

## 两台Director Server做主备

规划：
| 机器          | IP        |
| ------------- | --------- |
| VIP           | 10.0.0.8  |
| director 主   | 10.0.0.40 |
| director 备   | 10.0.0.41 |
| realserver1   | 10.0.0.42 |
| realserver2   | 10.0.0.43 |
| 网卡interface | eth0      |

### 主Director Server

```txt
vrrp_sync_group GOP {
    group {
        VI_PRI_CONNECT
        VI_PRI_AUTH
    }
}

vrrp_instance VI_PRI_CONNECT {
    state MASTER
    interface eth0
    virtual_router_id 128
    priority 110                    # 主的权重要设置高一些
    advert_int 1
    nopreempt
    unicast_src_ip 10.0.0.40        # 本机的IP
    unicast_peer {
        10.0.0.41                   # 其他Keepalived机器的IP，可以写多个
    }
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        10.0.0.8/24 dev eth0
    }
}


virtual_server 10.0.0.8 80 {
    delay_loop 6
    lb_algo rr
    lb_kind DR
    protocol TCP


    real_server 10.0.0.42 80 {
        weight 100
        TCP_CHECK {
                connect_timeout 3
                nb_get_retry 3
                delay_before_retry 3
                connect_port 80
        }
    }
    real_server 10.0.0.43 80 {
        weight 100
        TCP_CHECK {
                connect_timeout 3
                nb_get_retry 3
                delay_before_retry 3
                connect_port 80
        }
    }
}
```

### 备Director Server

```txt
vrrp_sync_group GOP {
    group {
        VI_PRI_CONNECT
        VI_PRI_AUTH
    }
}

vrrp_instance VI_PRI_CONNECT {
    state BACKUP
    interface eth0
    virtual_router_id 128
    priority 100
    advert_int 1
    nopreempt
    unicast_src_ip 10.0.0.41            # 本机的IP
    unicast_peer {
        10.0.0.40                       # 其他Keepalived机器的IP，可以写多个
    }
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        10.0.0.8/24 dev eth0
    }
}


virtual_server 10.0.0.8 80 {
    delay_loop 6
    lb_algo rr
    lb_kind DR
    protocol TCP


    real_server 10.0.0.42 80 {
        weight 100
        TCP_CHECK {
                connect_timeout 3
                nb_get_retry 3
                delay_before_retry 3
                connect_port 80
        }
    }
    real_server 10.0.0.43 80 {
        weight 100
        TCP_CHECK {
                connect_timeout 3
                nb_get_retry 3
                delay_before_retry 3
                connect_port 80
        }
    }
}
```
