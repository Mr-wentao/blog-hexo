---
title: 腾讯云tke-ingress开启ingress域名访问日志
tags: 腾讯云tke-ingress开启ingress域名访问日志
---

**容器类型为containers的tke集群控制台创建完ingress-controller之后，由于默认日志是打印在pod内的文件，现在需要自行收集访问日志，需要把日志打印在正常的pod输出上在收集**

在ingress-controller中默认nginx配置为
```bash
  access-log-path: /var/log/nginx/nginx_access.log
  error-log-path: /var/log/nginx/nginx_error.log
  log-format-upstream: $remote_addr - $remote_user [$time_iso8601] $msec "$request"
    $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length $request_time
    [$proxy_upstream_name] [$proxy_alternative_upstream_name] [$upstream_addr] [$upstream_response_length]
    [$upstream_response_time] [$upstream_status] $req_id
```
**修改成以下内容**

```yaml
  access-log-path: /dev/stdout
  error-log-path: /dev/stderr
  log-format-escape-json: "true"
  log-format-upstream: '{"@timestamp":"$time_iso8601","server_addr":"$server_addr","remote_addr":"$remote_addr","scheme":"$scheme","request_method":"$request_method","request_uri":"$request_uri","request_length":"$request_length","uri":"$uri","request_time":$request_time,"body_bytes_sent":$body_bytes_sent,"bytes_sent":$bytes_sent,"status":"$status","upstream_host":"$upstream_addr","domain":"$host","http_user_agent":"$http_user_agent","up_r_time":"$upstream_response_time","up_status":"$upstream_status","ip":"$http_ip","listen_port":"$server_port"}'

```

**修改完之后重启ingress-controller,日志会输出到/var/log/containers/ 目录下**
filebeat配置收集ingress日志
```yaml
    - type: container
      symlinks: true
      enabled: true
      json.keys_under_root: true
      json.overwrite_keys: true
      json.add_error_key: true
      tail_files: true
      paths:
        - /var/log/containers/*ingress-nginx-controller*.log
      processors:
        - decode_json_fields:
            fields: ['log']
            target: ""
            overwrite_keys: false
            process_array: false
            max_depth: 1
        - drop_event:
            when:
              or:
              - regexp:
                  http_user_agent: 'Go-http-client'
              - regexp:
                  domain: 'aaa.xxx.com' #删除不需要的域名

      fields:
        log_topic: "ingress-logs"
        type: "ingress-logs"

```
