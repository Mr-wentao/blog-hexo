---
title: prometheus
categories:
  - 常用YAML
tags:
  - k8s
date: 2023-12-28 14:50:14
---

## prometheus.yaml

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
- apiGroups: [""]
  resources:
  - nodes
  - nodes/proxy
  - services
  - endpoints
  - pods
  verbs: ["get", "list", "watch"]
- apiGroups:
  - extensions
  - networking.k8s.io # 兼容不同version的权限 fix 修复权限问题
  resources:
  - ingresses
  verbs: ["get", "list", "watch"]
- nonResourceURLs: ["/metrics"]
  verbs: ["get"]

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: monitor

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
- kind: ServiceAccount
  name: prometheus
  namespace: monitor

---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    name: prometheus-deployment
  name: prometheus
  namespace: monitor
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - image: prom/prometheus:v2.33.1
        name: prometheus
        command:
        - "/bin/prometheus"
        args:
        - "--config.file=/etc/prometheus/prometheus.yml"
        - "--storage.tsdb.path=/prometheus"
        - "--storage.tsdb.retention=24h"
        - "--web.enable-lifecycle"
        ports:
        - containerPort: 9090
          protocol: TCP
        volumeMounts:
        - mountPath: "/prometheus"
          name: data
        - mountPath: "/etc/prometheus"
          name: config-volume
        resources:
          requests:
            cpu: "4"
            memory: "8Gi"
          limits:
            cpu: "4"
            memory: "8Gi"
      volumes:
      - name: data
        emptyDir: {}
      - name: config-volume
        configMap:
          name: prometheus-config
---
kind: Service
apiVersion: v1
metadata:
  labels:
    app: prometheus
  name: prometheus
  namespace: monitor
spec:
  type: NodePort
  ports:
  - port: 9090
    targetPort: 9090
    nodePort: 30090
  selector:
    app: prometheus
```

## configmap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitor
data:
  prometheus.yml: |
    global:
      scrape_interval:     15s
      evaluation_interval: 15s

    scrape_configs:
      - job_name: 'apiservers'
        kubernetes_sd_configs:
        - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
          action: keep
          regex: default;kubernetes;https

      - job_name: 'cadvisor'
        kubernetes_sd_configs:
        - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
          insecure_skip_verify: false
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - action: labelmap
          regex: __meta_kubernetes_node_label_(.+)
        - target_label: __address__
          replacement: kubernetes.default.svc:443
        - source_labels: [__meta_kubernetes_node_name]
          regex: (.+)
          target_label: __metrics_path__
          replacement: /api/v1/nodes/${1}/proxy/metrics/cadvisor

      - job_name: "kubelet"
        honor_timestamps: true
        scrape_interval: 1m
        scrape_timeout: 1m
        metrics_path: /metrics
        scheme: https
        kubernetes_sd_configs:
        - role: node
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
          insecure_skip_verify: false
        relabel_configs:
        - separator: ;
          regex: __meta_kubernetes_node_label_(.+)
          replacement: $1
          action: labelmap
        - separator: ;
          regex: (.*)
          target_label: __address__
          replacement: kubernetes.default.svc:443
          action: replace
        - source_labels: [__meta_kubernetes_node_name]
          separator: ;
          regex: (.+)
          target_label: __metrics_path__
          replacement: /api/v1/nodes/${1}/proxy/metrics
          action: replace

      - job_name: 'service_endpoints_metrics'
        # service 需要添加元数据 通常需要有 /metrics 接口返回 prometheus 数据格式
        # prometheus.io/path: /metrics
        # prometheus.io/port: "8080"
        # prometheus.io/scrape: "true"

        kubernetes_sd_configs:
        - role: endpoints
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_name]
          target_label: service_name
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scheme]
          action: replace
          target_label: __scheme__
          regex: (https?)
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
          action: replace
          target_label: __address__
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2


        - action: labelmap
          regex: __meta_kubernetes_service_label_(.+)
        - source_labels: [__meta_kubernetes_namespace]
          target_label: namespace
        - source_labels: [__meta_kubernetes_service_name]
          target_label: service_name
        - source_labels: [__meta_kubernetes_pod_host_ip]
          target_label: node_ip
        - source_labels: [__meta_kubernetes_pod_ip]
          target_label: pod_ip
        

      - job_name: 'http_get'
        # service 需要添加元数据
        # prometheus.io/path: /actuator/info
        # prometheus.io/http_get: "true"

        metrics_path: /probe
        params:
          module: [http_2xx]
        kubernetes_sd_configs:
        - role: service
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_http_get]
          action: keep
          regex: true

        # server.dev.svc:80   __address__
        # /actuator/info     __meta_kubernetes_service_annotation_prometheus_io_path
        # 最后匹配出 server.dev.svc:80/actuator/info

        - source_labels: [__address__,__meta_kubernetes_service_annotation_prometheus_io_path]
          action: replace
          regex: (.+);(.*)
          replacement: http://$1$2  # 拼接需要监控的url
          target_label: __param_target

        - target_label: __address__
          replacement: blackbox-exporter.monitor.svc:9115

        - source_labels: [__param_target]
          target_label: instance

        # 额外添加标签
        - action: labelmap
          regex: __meta_kubernetes_service_label_(.+)

        - source_labels: [__meta_kubernetes_namespace]
          target_label: namespace

        - source_labels: [__meta_kubernetes_service_name]
          target_label: service_name

        - source_labels: [__meta_kubernetes_service_name]
          target_label: app


      - job_name: 'ingresses_http_get'

        # ingresses that have "kubernetes.io/probed = true" annotation
        # ingresses that have "kubernetes.io/path = "/actuator/info" annotation

        metrics_path: /probe
        params:
          module: [http_2xx]
        kubernetes_sd_configs:
        - role: ingress
        relabel_configs:

        - source_labels: [__meta_kubernetes_ingress_annotation_kubernetes_io_probed]
          action: keep
          regex: true

        - source_labels: [__meta_kubernetes_ingress_scheme,__address__,__meta_kubernetes_ingress_annotation_kubernetes_io_path]
          target_label: __param_target
          regex: (.+);(.+);(.*)
          replacement: ${1}://${2}${3}

        - target_label: __address__
          replacement: 192.168.1.10:9115 # 监控 ingress域名 使用外部blackbox-exporter

        - source_labels: [__param_target]
          target_label: instance

        # 额外添加标签
        - action: labelmap
          regex: __meta_kubernetes_ingress_label_(.+)

        - source_labels: [__meta_kubernetes_namespace]
          target_label: kubernetes_namespace

        - source_labels: [__meta_kubernetes_ingress_name]
          target_label: kubernetes_name
        - source_labels: [__meta_kubernetes_ingress_name]
          target_label: app

```