---
title: prometheus监控部署及常规组件
tags: prometheus监控部署及常规组件
categories:
  - 监控
abbrlink: f8409f7f
---

**prometheus.yaml**

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
      - image: harbor.ingeek.com/base/prometheus:v2.32.1
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

**prometheus的configmap**

```yaml
---
kind: ConfigMap
apiVersion: v1
metadata:
  name: prometheus-config
  namespace: monitor
data:
  prometheus.yml: |
    global:
      scrape_interval:     30s
      evaluation_interval: 30s

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

      - job_name: "kube-state-metrics"
        metrics_path: /metrics
        kubernetes_sd_configs:
        - role: endpoints
        
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape, __meta_kubernetes_endpoints_label_app_kubernetes_io_name]
          separator: ;
          regex: true;kube-state-metrics
          replacement: $1
          action: keep
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scheme]
          separator: ;
          regex: (https?)
          target_label: __scheme__
          replacement: $1
          action: replace
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
          separator: ;
          regex: (.+)
          target_label: __metrics_path__
          replacement: $1
          action: replace
        - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
          separator: ;
          regex: (.+)(?::\d+);(\d+)
          target_label: __address__
          replacement: $1:$2
          action: replace

      - job_name: "mysql-exporter"
        metrics_path: /metrics
        kubernetes_sd_configs:
        - role: endpoints
        
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_dept]
          action: replace
          target_label: dept
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_port]
          regex: 9104
          action: keep
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_env]
          action: replace
          target_label: env
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_app]
          action: replace
          target_label: app
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_project]
          action: replace
          target_label: project

        - source_labels: [__meta_kubernetes_namespace]
          target_label: namespace
        - source_labels: [__meta_kubernetes_service_name]
          target_label: service_name


      - job_name: "kafka-exporter"
        metrics_path: /metrics
        kubernetes_sd_configs:
        - role: endpoints
        
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_dept]
          action: replace
          target_label: dept
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_port]
          regex: 9308
          action: keep
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_env]
          action: replace
          target_label: env
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_app]
          action: replace
          target_label: app
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_project]
          action: replace
          target_label: project

        - source_labels: [__meta_kubernetes_namespace]
          target_label: namespace
        - source_labels: [__meta_kubernetes_service_name]
          target_label: service_name


      - job_name: "elastic-exporter"
        metrics_path: /metrics
        kubernetes_sd_configs:
        - role: endpoints
        
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_dept]
          action: replace
          target_label: dept
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_port]
          regex: 9114
          action: keep
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_env]
          action: replace
          target_label: env
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_app]
          action: replace
          target_label: app
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_project]
          action: replace
          target_label: project

        - source_labels: [__meta_kubernetes_namespace]
          target_label: namespace
        - source_labels: [__meta_kubernetes_service_name]
          target_label: service_name

      - job_name: "redis-exporter"
        metrics_path: /metrics
        kubernetes_sd_configs:
        - role: endpoints
        
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_dept]
          action: replace
          target_label: dept
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_port]
          regex: 9121
          action: keep
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_env]
          action: replace
          target_label: env
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_app]
          action: replace
          target_label: app
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_project]
          action: replace
          target_label: project

        - source_labels: [__meta_kubernetes_namespace]
          target_label: namespace
        - source_labels: [__meta_kubernetes_service_name]
          target_label: service_name


      - job_name: 'service_endpoints_metrics'
        # service 需要添加元数据 通常需要有 /metrics 接口返回 prometheus 数据格式
        # prometheus.io/path: /metrics
        # prometheus.io/port: "8080"
        # prometheus.io/scrape: "true"
        # prometheus.io/env: "dev"
        # prometheus.io/dept: "qz"
        # prometheus.io/project: "ops"

        kubernetes_sd_configs:
        - role: endpoints
        relabel_configs:
        - source_labels: [__meta_kubernetes_endpoints_label_app_kubernetes_io_name]
          regex: kube-state-metrics
          action: drop
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_port]
          regex: (9104|9308|9114|9121)
          action: keep
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
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_env]
          action: replace
          target_label: env
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_dept]
          action: replace
          target_label: dept
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_app]
          action: replace
          target_label: app
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_project]
          action: replace
          target_label: project
        - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
          action: replace
          target_label: __address__
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2

        - source_labels: [__meta_kubernetes_namespace]
          target_label: namespace
        - source_labels: [__meta_kubernetes_service_name]
          target_label: service_name

      - job_name: 'http_get'
        # service 需要添加元数据
        # prometheus.io/path: /actuator/info
        # prometheus.io/http_get: "true"
        # prometheus.io/env: "true"
        # prometheus.io/project: "true"
        # prometheus.io/dept: "true"

        metrics_path: /probe
        params:
          module: [http_2xx]
        kubernetes_sd_configs:
        - role: service
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_http_get]
          action: keep
          regex: true

        # idk-mob-sdk-server.dev.svc:80   __address__
        # /actuator/info     __meta_kubernetes_service_annotation_prometheus_io_path
        # 最后匹配出  idk-mob-sdk-server.dev.svc:80/actuator/info

        - source_labels: [__address__,__meta_kubernetes_service_annotation_prometheus_io_path]
          action: replace
          regex: (.+);(.*)
          replacement: http://$1$2  # 拼接需要监控的url
          target_label: __param_target

        - target_label: __address__
          replacement: blackbox-exporter.monitor.svc:9115

        - source_labels: [__meta_kubernetes_service_annotation_kubernetes_io_env]
          action: replace
          target_label: env
        - source_labels: [__meta_kubernetes_service_annotation_kubernetes_io_project]
          action: replace
          target_label: project
        - source_labels: [__meta_kubernetes_service_annotation_kubernetes_io_dept]
          action: replace
          target_label: dept

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


      - job_name: 'ingress_http_get'

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
          replacement: 10.200.4.63:9115 # 监控 ingress域名 使用外部blackbox-exporter

        - source_labels: [__param_target]
          target_label: instance

        - source_labels: [__meta_kubernetes_ingress_annotation_kubernetes_io_auth]
          action: replace
          target_label: auth
        - source_labels: [__meta_kubernetes_ingress_annotation_kubernetes_io_env]
          action: replace
          target_label: env
        - source_labels: [__meta_kubernetes_ingress_annotation_kubernetes_io_project]
          action: replace
          target_label: project
        - source_labels: [__meta_kubernetes_ingress_annotation_kubernetes_io_dept]
          action: replace
          target_label: dept


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
**kube-state-metrics.yaml**
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    app.kubernetes.io/component: exporter
    app.kubernetes.io/name: kube-state-metrics
    app.kubernetes.io/version: 2.5.0
  name: kube-state-metrics
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kube-state-metrics
subjects:
- kind: ServiceAccount
  name: kube-state-metrics
  namespace: monitor
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    app.kubernetes.io/component: exporter
    app.kubernetes.io/name: kube-state-metrics
    app.kubernetes.io/version: 2.5.0
  name: kube-state-metrics
rules:
- apiGroups:
  - ""
  resources:
  - configmaps
  - secrets
  - nodes
  - pods
  - services
  - resourcequotas
  - replicationcontrollers
  - limitranges
  - persistentvolumeclaims
  - persistentvolumes
  - namespaces
  - endpoints
  verbs:
  - list
  - watch
- apiGroups:
  - apps
  resources:
  - statefulsets
  - daemonsets
  - deployments
  - replicasets
  verbs:
  - list
  - watch
- apiGroups:
  - batch
  resources:
  - cronjobs
  - jobs
  verbs:
  - list
  - watch
- apiGroups:
  - autoscaling
  resources:
  - horizontalpodautoscalers
  verbs:
  - list
  - watch
- apiGroups:
  - authentication.k8s.io
  resources:
  - tokenreviews
  verbs:
  - create
- apiGroups:
  - authorization.k8s.io
  resources:
  - subjectaccessreviews
  verbs:
  - create
- apiGroups:
  - policy
  resources:
  - poddisruptionbudgets
  verbs:
  - list
  - watch
- apiGroups:
  - certificates.k8s.io
  resources:
  - certificatesigningrequests
  verbs:
  - list
  - watch
- apiGroups:
  - storage.k8s.io
  resources:
  - storageclasses
  - volumeattachments
  verbs:
  - list
  - watch
- apiGroups:
  - admissionregistration.k8s.io
  resources:
  - mutatingwebhookconfigurations
  - validatingwebhookconfigurations
  verbs:
  - list
  - watch
- apiGroups:
  - networking.k8s.io
  resources:
  - networkpolicies
  - ingresses
  verbs:
  - list
  - watch
- apiGroups:
  - coordination.k8s.io
  resources:
  - leases
  verbs:
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  labels:
    app.kubernetes.io/component: exporter
    app.kubernetes.io/name: kube-state-metrics
    app.kubernetes.io/version: 2.5.0
  name: kube-state-metrics
  namespace: monitor
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: kube-state-metrics
subjects:
- kind: ServiceAccount
  name: kube-state-metrics
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  labels:
    app.kubernetes.io/component: exporter
    app.kubernetes.io/name: kube-state-metrics
    app.kubernetes.io/version: 2.5.0
  name: kube-state-metrics
  namespace: monitor
rules:
- apiGroups:
  - ""
  resources:
  - pods
  verbs:
  - get
- apiGroups:
  - apps
  resourceNames:
  - kube-state-metrics
  resources:
  - statefulsets
  verbs:
  - get
---
apiVersion: v1
automountServiceAccountToken: false
kind: ServiceAccount
metadata:
  labels:
    app.kubernetes.io/component: exporter
    app.kubernetes.io/name: kube-state-metrics
    app.kubernetes.io/version: 2.5.0
  name: kube-state-metrics
  namespace: monitor
---
apiVersion: v1
kind: Service
metadata:
  annotations:
    prometheus.io/path: /metrics
    # prometheus.io/port: "8080"
    prometheus.io/scrape: "true"
    prometheus.io/app: "kube-state-metrics"
    prometheus.io/project: "ingeek"

  labels:
    app.kubernetes.io/component: exporter
    app.kubernetes.io/name: kube-state-metrics
    app.kubernetes.io/version: 2.5.0
  name: kube-state-metrics
  namespace: monitor
spec:
  clusterIP: None
  ports:
  - name: http-metrics
    port: 8080
    targetPort: http-metrics
  - name: telemetry
    port: 8081
    targetPort: telemetry
  selector:
    app.kubernetes.io/name: kube-state-metrics
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app.kubernetes.io/component: exporter
    app.kubernetes.io/name: kube-state-metrics
    app.kubernetes.io/version: 2.5.0
  name: kube-state-metrics
  namespace: monitor
spec:
  replicas: 2
  selector:
    matchLabels:
      app.kubernetes.io/name: kube-state-metrics
  serviceName: kube-state-metrics
  template:
    metadata:
      labels:
        app.kubernetes.io/component: exporter
        app.kubernetes.io/name: kube-state-metrics
        app.kubernetes.io/version: 2.5.0
    spec:
      automountServiceAccountToken: true
      containers:
      - args:
        - --pod=$(POD_NAME)
        - --pod-namespace=$(POD_NAMESPACE)
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        image: registry.cn-hangzhou.aliyuncs.com/yaml/images:kube-state-metrics-2.5.0	
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 5
          timeoutSeconds: 5
        name: kube-state-metrics
        ports:
        - containerPort: 8080
          name: http-metrics
        - containerPort: 8081
          name: telemetry
        readinessProbe:
          httpGet:
            path: /
            port: 8081
          initialDelaySeconds: 5
          timeoutSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
          runAsUser: 65534
      nodeSelector:
        kubernetes.io/os: linux
      serviceAccountName: kube-state-metrics
```

**metrics-server**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: monitor
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
    rbac.authorization.k8s.io/aggregate-to-admin: "true"
    rbac.authorization.k8s.io/aggregate-to-edit: "true"
    rbac.authorization.k8s.io/aggregate-to-view: "true"
  name: system:aggregated-metrics-reader
rules:
- apiGroups:
  - metrics.k8s.io
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
rules:
- apiGroups:
  - ""
  resources:
  - nodes/metrics
  verbs:
  - get
- apiGroups:
  - ""
  resources:
  - pods
  - nodes
  - nodes/stats
  - namespaces
  - configmaps
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server-auth-reader
  namespace: monitor
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: extension-apiserver-authentication-reader
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: monitor
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server:system:auth-delegator
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:auth-delegator
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: monitor
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:metrics-server
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: monitor
---
apiVersion: v1
kind: Service
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: monitor
spec:
  ports:
  - name: https
    port: 443
    protocol: TCP
    targetPort: https
  selector:
    k8s-app: metrics-server
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: monitor
spec:
  replicas: 1
  selector:
    matchLabels:
      k8s-app: metrics-server
  template:
    metadata:
      labels:
        k8s-app: metrics-server
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=4443
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
        - --kubelet-insecure-tls
        image: harbor.ingeek.com/base/metrics-server:v0.6.4
        imagePullPolicy: IfNotPresent
        livenessProbe:
          failureThreshold: 3
          httpGet:
            path: /livez
            port: https
            scheme: HTTPS
          periodSeconds: 10
        name: metrics-server
        ports:
        - containerPort: 4443
          name: https
          protocol: TCP
        readinessProbe:
          failureThreshold: 3
          httpGet:
            path: /readyz
            port: https
            scheme: HTTPS
          initialDelaySeconds: 20
          periodSeconds: 10
        resources:
          requests:
            cpu: 200m
            memory: 400Mi
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1000
        volumeMounts:
        - mountPath: /tmp
          name: tmp-dir
      nodeSelector:
        kubernetes.io/os: linux
      priorityClassName: system-cluster-critical
      serviceAccountName: metrics-server
      volumes:
      - emptyDir: {}
        name: tmp-dir
---
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  labels:
    k8s-app: metrics-server
  name: v1beta1.metrics.k8s.io
spec:
  group: metrics.k8s.io
  groupPriorityMinimum: 100
  insecureSkipTLSVerify: true
  service:
    name: metrics-server
    namespace: monitor
  version: v1beta1
  versionPriority: 100
```