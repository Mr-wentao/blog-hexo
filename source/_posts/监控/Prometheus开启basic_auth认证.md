---
title: Prometheus开启basic_auth认证
abbrlink: 165a0cd3
cover: 'https://s3.babudiu.com/iuxt//images/202211212208509.svg'
categories:
  - 监控
tags:
  - Auth
  - Prometheus
  - prometheus
date: 2022-06-09 17:19:43
---

考虑将公司的联邦集群（pull）换成remote_write（push）这种形式， 所以需要将Prometheus开放到公网，看了看认证相关的配置

也可以使用Nginx来反向代理，可以参考 [Nginx开启基本http认证](/posts/5855bc56)， 不过Prometheus原生带了basic auth 和ssl认证

## 开启web配置文件

```bash
./prometheus --web.config.file="web.yml"  --web.listen-address="0.0.0.0:9001"
```

## 生成密码

密码需要bcrypt加密，这里使用`htpasswd`工具生成

{% tabs TabName %}

<!-- tab Ubuntu和Debian安装 -->
```bash
apt install apache2-utils
```
<!-- endtab -->

<!-- tab CentOS和Fedora安装 -->
```bash
yum install httpd-tools
```
<!-- endtab -->

{% endtabs %}

```bash
htpasswd -nB 'admin'
```

## web配置文件

vim web.yml

```yml
basic_auth_users:
  admin: $2y$05$UKSS18ztdsUNoEuXYScr2OE1TCMe1hWnmD6JuwUi/uPTJayHIakae
```

## remote write 访问

后面访问控制台页面或者调用接口都需要指定账号密码了

```bash
curl -u admin:xxxxx http://localhost:9090
```

其他Prometheus如果需要往这台写入， 需要在其他的Prometheus remote_write配置认证

```yml
remote_write:
- url: "http://127.0.0.1:9090/api/v1/write"
  basic_auth:
    username: admin
    password: xxxxx
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

## 联邦配置

如果此Prometheus需要通过联邦机制接入到其他Prometheus， 需要在对方的配置里面增加：

```yml
  - job_name: 'federate-http'
    scrape_interval: 30s
    scrape_timeout: 30s
    honor_labels: true
    metrics_path: '/federate'
    basic_auth:
      username: 'admin'
      password: 'xxxxx'
    params:
      'match[]':
        - '{job=~".+"}'
    file_sd_configs:
      - files:
          - /data/prometheus/conf.d/federate_http.yml
        refresh_interval: 30s
```
