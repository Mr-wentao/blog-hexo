---
title: Prometheus通过remote_write写入数据到另一台Prometheus
abbrlink: 666e547f
cover: 'https://s3.babudiu.com/iuxt//images/202211212208509.svg'
categories:
  - 监控
tags:
  - Prometheus
  - prometheus
date: 2022-06-09 18:57:20
---

比如要从Prometheus_A写入到Prometheus_B

## B开启remote_write_receiver

Prometheus_B需要打开接收远程写入的功能，通过增加启动参数`--web.enable-remote-write-receiver`：

```bash
./prometheus --web.enable-remote-write-receiver --web.config.file=web.yml --web.listen-address=0.0.0.0:9090
```

> 远程写的接口地址`/api/v1/write`

## B开启认证

参考[Prometheus开启basic_auth认证](/posts/165a0cd3/)

## A开启remote_write

Prometheus_A需要将remote_write写入到A的接口

```yml
remote_write:
- url: "http://127.0.0.1:9090/api/v1/write"
  basic_auth:                   # 开启认证后需要配置
    username: admin             # 开启认证后需要配置
    password: xxxxxx            # 开启认证后需要配置
  remote_timeout: 30s
  tls_config:
    insecure_skip_verify: true
  queue_config:
    capacity: 500
    max_shards: 1000
    min_shards: 1
    max_samples_per_send: 100
    batch_send_deadline: 5s
    min_backoff: 30ms
    max_backoff: 100ms
```
