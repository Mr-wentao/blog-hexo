---
title: 在Kubernetes集群中部署多个Nginx Ingress Controller
categories:
  - Kubernetes
tags:
  - Ingress
  - Nginx
abbrlink: c4b9bd31
date: 2023-05-30 16:03:44
---


为什么要在集群中部署两个Nginx Ingress Controller？ 因为公司的入口目前是在一个Ingress上， 公网域名也解析到了这个Ingress Controller上面，不过有些内网的服务，我们并不想让它暴露在外，那么可以再部署一个内网使用的Ingress Controller。

官方介绍地址：<https://kubernetes.github.io/ingress-nginx/user-guide/multiple-ingress/>

我准备将这两个ingressclass放在两个namespace里面。

## 先抽出clusterrole 和 clusterrolebinding

因为可以使用一个clusterrole，没必要每个ingress controller都创建clusterrole

```yml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.3.1
  name: ingress-nginx
rules:
- apiGroups:
  - ""
  resources:
  - configmaps
  - endpoints
  - nodes
  - pods
  - secrets
  - namespaces
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
- apiGroups:
  - ""
  resources:
  - nodes
  verbs:
  - get
- apiGroups:
  - ""
  resources:
  - services
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - networking.k8s.io
  resources:
  - ingresses
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - ""
  resources:
  - events
  verbs:
  - create
  - patch
- apiGroups:
  - networking.k8s.io
  resources:
  - ingresses/status
  verbs:
  - update
- apiGroups:
  - networking.k8s.io
  resources:
  - ingressclasses
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    app.kubernetes.io/component: admission-webhook
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.3.1
  name: ingress-nginx-admission
rules:
- apiGroups:
  - admissionregistration.k8s.io
  resources:
  - validatingwebhookconfigurations
  verbs:
  - get
  - update

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.3.1
  name: ingress-nginx
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ingress-nginx
subjects:
# 这里绑定了两个ServiceAccount
- kind: ServiceAccount
  name: internet-ingress-nginx
  namespace: internet-ingress-nginx
- kind: ServiceAccount
  name: intranet-ingress-nginx
  namespace: intranet-ingress-nginx
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    app.kubernetes.io/component: admission-webhook
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.3.1
  name: ingress-nginx-admission
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ingress-nginx-admission
subjects:
# 这里绑定了两个ServiceAccount
- kind: ServiceAccount
  name: intranet-ingress-nginx-admission
  namespace: intranet-ingress-nginx
- kind: ServiceAccount
  name: internet-ingress-nginx-admission
  namespace: internet-ingress-nginx
```

## 修改namespace

所有namespace都需要修改成新的

## 修改ingressclass

```yml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  labels:
    app.kubernetes.io/component: controller
    app.kubernetes.io/instance: internet-ingress-nginx
    app.kubernetes.io/name: internet-ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.3.1
  name: internet                                        # ingressclass 名字，和controller的启动参数需要保持一致
spec:
  controller: k8s.io/internet-ingress-nginx             # controller 名字，和controller的启动参数需要保持一致
```

## 修改启动参数

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/component: controller
    app.kubernetes.io/instance: internet-ingress-nginx
    app.kubernetes.io/name: internet-ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.3.1
  name: ingress-nginx-controller
  namespace: internet-ingress-nginx
spec:
  minReadySeconds: 0
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      app.kubernetes.io/component: controller
      app.kubernetes.io/instance: internet-ingress-nginx
      app.kubernetes.io/name: internet-ingress-nginx
  template:
    metadata:
      labels:
        app.kubernetes.io/component: controller
        app.kubernetes.io/instance: internet-ingress-nginx
        app.kubernetes.io/name: internet-ingress-nginx
    spec:
      containers:
      - args:
        - /nginx-ingress-controller
        - --election-id=ingress-controller-leader
        - --controller-class=k8s.io/internet-ingress-nginx            # 和上面的controller保持一致
        - --ingress-class=internet                                    # 和上面的ingressclass保持一致
        - --configmap=$(POD_NAMESPACE)/ingress-nginx-controller
        - --validating-webhook=:8443
        - --validating-webhook-certificate=/usr/local/certificates/cert
        - --validating-webhook-key=/usr/local/certificates/key
```

## 一个例子

这是我修改好的yaml文件，可以直接apply即可创建ingress controller

<https://github.com/iuxt/ops/tree/master/kubernetes/infra/nginx-ingress/multi-ingress-controller>
