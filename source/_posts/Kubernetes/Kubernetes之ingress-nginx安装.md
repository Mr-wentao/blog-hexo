---
title: Kubernetes之ingress-nginx安装配置
abbrlink: 30bdb1c5
cover: 'https://static.zahui.fan/images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - ingress
  - nginx
date: 2022-03-05 17:41:44
---

## 部署ingress-nginx

> ingress-nginx 官方文档 <https://kubernetes.github.io/ingress-nginx/deploy/#bare-metal-clusters>  
> 自建的Kubernetes可以参数`bare-metal`安装

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.2/deploy/static/provider/baremetal/deploy.yaml
```

部署成功后修改NodePort,把里面30xxx的端口换成你想要的端口

```bash
kubectl edit service ingress-nginx-controller -n ingress-nginx
```

> 也可以`wget https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.2/deploy/static/provider/baremetal/deploy.yaml`再编辑

在

```yml
---
# Source: ingress-nginx/templates/controller-service.yaml
apiVersion: v1
kind: Service
metadata:
  annotations:
  labels:
    helm.sh/chart: ingress-nginx-4.0.7
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 1.0.5
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  type: NodePort
  ipFamilyPolicy: SingleStack
  ipFamilies:
    - IPv4
  ports:
    - name: http
      port: 80
      nodePort: 30080
      protocol: TCP
      targetPort: http
      appProtocol: http
    - name: https
      port: 443
      nodePort: 30443
      protocol: TCP
      targetPort: https
      appProtocol: https
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/component: controller
---
```

> 当然也可以不做以上修改，不修改的话会自动在30000~32767自动生成一个，需要把自动生成的端口配置到负载均衡器上。

## 通过daemonset方式安装

通过daemonset安装一般来说都是以hostnetwork方式来，直接监听node节点上的80、443端口  
将上述yaml中deployment的部分换成daemonset部署

```yml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    helm.sh/chart: ingress-nginx-3.39.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.49.3
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: ingress-nginx
      app.kubernetes.io/instance: ingress-nginx
      app.kubernetes.io/component: controller
  revisionHistoryLimit: 10
  minReadySeconds: 0
  template:
    metadata:
      labels:
        app.kubernetes.io/name: ingress-nginx
        app.kubernetes.io/instance: ingress-nginx
        app.kubernetes.io/component: controller
    spec:
      containers:
        - name: controller
          image: k8s.gcr.io/ingress-nginx/controller:v0.49.3@sha256:35fe394c82164efa8f47f3ed0be981b3f23da77175bbb8268a9ae438851c8324
          imagePullPolicy: IfNotPresent
          lifecycle:
            preStop:
              exec:
                command:
                  - /wait-shutdown
          args:
            - /nginx-ingress-controller
            - --publish-service=$(POD_NAMESPACE)/ingress-nginx-controller
            - --election-id=ingress-controller-leader
            - --ingress-class=nginx
            - --configmap=$(POD_NAMESPACE)/ingress-nginx-controller
            - --validating-webhook=:8443
            - --validating-webhook-certificate=/usr/local/certificates/cert
            - --validating-webhook-key=/usr/local/certificates/key
            - --default-backend-service=$(POD_NAMESPACE)/ingress-nginx-default-backend
          securityContext:
            capabilities:
              drop:
                - ALL
              add:
                - NET_BIND_SERVICE
            runAsUser: 101
            allowPrivilegeEscalation: true
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: LD_PRELOAD
              value: /usr/local/lib/libmimalloc.so
          livenessProbe:
            failureThreshold: 5
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          ports:
            - name: prometheus
              containerPort: 10254
            - name: http
              containerPort: 80
              protocol: TCP
            - name: https
              containerPort: 443
              protocol: TCP
            - name: webhook
              containerPort: 8443
              protocol: TCP
          volumeMounts:
            - name: timezone
              mountPath: /etc/localtime                           # 挂载到容器的目录
            - name: webhook-cert
              mountPath: /usr/local/certificates/
              readOnly: true
          resources:
            requests:
              cpu: 100m
              memory: 90Mi
      # 这里修改为hostNetwork
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet

      tolerations:
      - key: "apptype"
        operator: "Exists"
        effect: "NoSchedule"

      nodeSelector:
        app: ingress
        kubernetes.io/os: linux
      serviceAccountName: ingress-nginx
      terminationGracePeriodSeconds: 300

      volumes:
        - name: timezone
          hostPath:
            path: /usr/share/zoneinfo/Asia/Shanghai            # 宿主机的目录
        - name: webhook-cert
          secret:
            secretName: ingress-nginx-admission
---
```

## ingress-nginx常见问题

1. 配置了ingress，但是打开404报错：
   查看deployment里面的ingress-nginx日志，发现报错：

    ```log
    "Ignoring ingress because of error while validating ingress class" ingress="cattle-system/rancher" error="ingress does not contain a valid IngressClass" 
    ```

    这种情况是ingress没有指定ingress controller, 添加ingress注解：

    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
    annotations:
        kubernetes.io/ingress.class: nginx
    ```
