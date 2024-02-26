---
title: logstash
categories:
  - 常用YAML
tags:
  - k8s
date: 2023-12-28 14:50:14
---

## logstash.yaml

```yaml
kind: Deployment
apiVersion: apps/v1
metadata:
  name: logstash-ingress-logs
  namespace: logstash
spec:
  replicas: 1
  selector:
    matchLabels:
      app: logstash-ingress-logs
  template:
    metadata:
      labels:
        app: logstash-ingress-logs
    spec:
      volumes:
        - name: logstash-ingress-logs-conf
          configMap:
            name: logstash-ingress-logs-conf
            defaultMode: 420
      containers:
        - name: logstash
          image: registry.cn-hangzhou.aliyuncs.com/yaml/images:logstash-7.14.2
          volumeMounts:
            - name: logstash-ingress-logs-conf
              mountPath: /usr/share/logstash/config/logstash.yml
              subPath: logstash.yml
            - name: logstash-ingress-logs-conf
              mountPath: /usr/share/logstash/pipeline/logstash.conf
              subPath: logstash.conf
            - name: logstash-ingress-logs-conf
              mountPath: /usr/share/logstash/config/jvm.options
              subPath: jvm.options
          imagePullPolicy: IfNotPresent
      restartPolicy: Always
```

## logstash的configmap

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: logstash-ingress-logs-conf
  namespace: logstash
data:
  jvm.options: |
    -Xms2g
    -Xmx3g
    -XX:+UseConcMarkSweepGC
    -XX:CMSInitiatingOccupancyFraction=75
    -XX:+UseCMSInitiatingOccupancyOnly
    -Djava.awt.headless=true
    -Dfile.encoding=UTF-8
    -Djruby.compile.invokedynamic=true
    -Djruby.jit.threshold=0
    -Djruby.regexp.interruptible=true
    -XX:+HeapDumpOnOutOfMemoryError
    -Djava.security.egd=file:/dev/urandom
  logstash.conf: |
    input {
      kafka {
        bootstrap_servers => "127.0.0.1:9092,127.0.0.1:9092,127.0.0.1:9092"
        topics => ["ingress-k8s"]
        codec => "json"
        consumer_threads => 3
        group_id => "k8s_group"
        decorate_events => true
        type => "logstash_mixins"
      }
    }

    filter{
        mutate{
            rename => ["[host][name]", "hostname"]
            remove_field => ["ecs","@version","input","host","agent","log"]
        }
    }

    output {
      if [type] == "logstash_mixins" {
          elasticsearch {
              action   => "index"
              hosts    => ["127.0.0.1:9200","127.0.0.1:9200","127.0.0.1:9200"]
              index    => "%{[fields][type]}-%{+YYYY.MM.dd}"
              user     => "elastic"
              password => "password"
          }
      }
    }
  logstash.yml: >-
    http.host: "0.0.0.0"

    path.config: /usr/share/logstash/pipeline

    pipeline.id: "ingress-logs"

    xpack.monitoring.enabled: true

    xpack.monitoring.elasticsearch.username: logstash_system

    xpack.monitoring.elasticsearch.password: "password"

    xpack.monitoring.elasticsearch.hosts: ["http://127.0.0.1:9200","http://127.0.0.1:9200","http://127.0.0.1:9200"]
```