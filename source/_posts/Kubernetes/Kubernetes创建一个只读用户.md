---
title: Kubernetes创建一个只读用户
categories:
  - Kubernetes
tags:
  - k8s
  - 权限管理
  - RBAC
abbrlink: lefa6qhl
cover: 'https://static.zahui.fan/images/202211212221065.svg'
date: 2023-02-22 14:15:01
---


其实用到的是RBAC授权，官方文档在：<https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/rbac/>

## 生成证书


```
# 生成私钥
openssl genrsa -out dev.key 2048

# 基于这个私钥生成证书请求
openssl req -new -key dev.key -out dev.csr -subj "/CN=dev"

# 使用CA证书签发
openssl  x509 -req -in dev.csr -CA /etc/kubernetes/pki/ca.crt -CAkey /etc/kubernetes/pki/ca.key -CAcreateserial -out dev.crt -days 3000
```

## 通过证书生成kubeconfig配置文件

```
# 生成用户kubeconfig
kubectl config set-cluster  kubernetes \   # kubeconfig 里面的 name
  --kubeconfig=dev.conf \                  # 生成的 kubeconfig 配置文件位置
  --server="https://10.0.0.20:6443" \      # 这里是你的集群apiserver地址
  --certificate-authority=/etc/kubernetes/pki/ca.crt \
  --embed-certs=true



# users 设置用户信息
kubectl config set-credentials dev \
    --certificate-authority=/etc/kubernetes/pki/ca.crt \
    --embed-certs=true \
    --client-key=dev.key \
    --client-certificate=dev.crt \
    --kubeconfig=dev.conf

  

#  根据 config 创建  contexts  
kubectl config set-context dev \
    --cluster=kubernetes \
    --user=dev \
    --kubeconfig=dev.conf


# 设置当前的上下文 -- 更改用户
kubectl config use-context dev --kubeconfig=dev.conf
```

## 创建clusterrole和clusterrolebinding

```yml
# 提供基本权限
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cluster-dev-readonly
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: dev-readonly
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: User
  name: dev

---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  name: dev-readonly
rules:
  - apiGroups: ["metrics.k8s.io"]
    resources: ["pods", "nodes"]
    verbs: ["get", "watch", "list"]

  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["get", "watch", "list"]

  - apiGroups: [""]
    resources: ["pods", "pods/exec"]
    verbs: ["create", "get", "list", "watch"]

  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["delete"]

  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]

  - apiGroups: [""]
    resources: ["endpoints", "services"]
    verbs: ["get", "watch", "list"]

  - apiGroups: [""]
    resources:
      [
        "resourcequotas/status",
        "resourcequotas",
        "bindings",
        "events",
        "limitranges",
        "namespaces/status",
        "pods/log",
        "pods/status",
        "replicationcontrollers/status",
      ]
    verbs: ["get", "watch", "list"]

  - apiGroups: [""]
    resources: ["namespaces"]
    verbs: ["get", "watch", "list"]

  - apiGroups: ["apps"]
    resources:
      [
        "deployments",
        "deployments/rollback",
        "deployments/scale",
        "deployments/rollout",
        "statefulsets",
      ]
    verbs: ["get", "watch", "list","patch"]

  - apiGroups: ["autoscaling"]
    resources: ["horizontalpodautoscalers"]
    verbs: ["get", "watch", "list"]
  - apiGroups: ["batch"]
    resources: ["cronjobs", "jobs", "scheduledjobs"]
    verbs: ["get", "watch", "list"]

  - apiGroups: ["extensions"]
    resources: ["daemonsets", "deployments", "ingresses", "replicasets"]
    verbs: ["get", "watch", "list"]
```

## 测试

```bash
kubectl --kubeconfig=./dev.conf get pod
```