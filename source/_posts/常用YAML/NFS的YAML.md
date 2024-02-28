---
title: NFS
categories:
  - 常用YAML
tags:
  - k8s
date: 2023-12-28 14:50:14
---

## 方式

```
# pv的访问模式:accessModes
RWO - readWriteOnce
ROX - readOnlyMany
RWX - readWriteMany

# pod申请pvc参考 test-pvc-pod.yml
# statefulset 申请pv pvc 参考 test-nginx-statefulset.yaml

可动态为kubernetes提供pv卷，是Kubernetes的简易NFS的外部provisioner，本身不提供NFS，需要现有的NFS服务器提供存储。
持久卷目录的命名规则为: ${namespace}-${pvcName}-${pvName}。

使用参考 目录内 test-nginx-statefulset.yaml test-pvc-pod.yml 文件
```


## nfs-provisioner-deploy.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nfs-client-provisioner
  namespace: kube-system
  labels:
    app: nfs-client-provisioner
spec:
  replicas: 1
  strategy: 
    type: Recreate # 设置升级策略为删除再创建(默认为滚动更新)
  selector:
    matchLabels:
      app: nfs-client-provisioner
  template:
    metadata:
      labels:
        app: nfs-client-provisioner
    spec:
      serviceAccountName: nfs-client-provisioner
      containers:
      - name: nfs-client-provisioner
        #image: gcr.io/k8s-staging-sig-storage/nfs-subdir-external-provisioner:v4.0.0
        image: registry.cn-beijing.aliyuncs.com/mydlq/nfs-subdir-external-provisioner:v4.0.0
        volumeMounts:
        - name: nfs-client-root
          mountPath: /persistentvolumes
        env:
        - name: PROVISIONER_NAME     # Provisioner的名称,以后设置的storageclass要和这个保持一致
          value: nfs-client 
        - name: NFS_SERVER           # NFS服务器地址,需和valumes参数中配置的保持一致
          value: 10.200.4.80
        - name: NFS_PATH             # NFS服务器数据存储目录,需和valumes参数中配置的保持一致
          value: /data/nfs/qz_k8s
      volumes:
      - name: nfs-client-root
        nfs:
          server: 10.200.4.80     # NFS服务器地址
          path: /data/nfs/qz_k8s # NFS服务器数据存储目录

```

## nfs-rbac

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nfs-client-provisioner
  namespace: kube-system
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: nfs-client-provisioner-runner
rules:
  - apiGroups: [""]
    resources: ["persistentvolumes"]
    verbs: ["get", "list", "watch", "create", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "list", "watch", "update"]
  - apiGroups: ["storage.k8s.io"]
    resources: ["storageclasses"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["create", "update", "patch"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: run-nfs-client-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    namespace: kube-system
roleRef:
  kind: ClusterRole
  name: nfs-client-provisioner-runner
  apiGroup: rbac.authorization.k8s.io
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
  namespace: kube-system
rules:
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
  namespace: kube-system
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    namespace: kube-system
roleRef:
  kind: Role
  name: leader-locking-nfs-client-provisioner
  apiGroup: rbac.authorization.k8s.io
```

### StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-storage
  annotations:
    storageclass.kubernetes.io/is-default-class: "false"  ## 是否设置为默认的storageclass
provisioner: nfs-client                                   ## 动态卷分配者名称，必须和上面创建的"provisioner"变量中设置的Name一致
parameters:
  archiveOnDelete: "true"                                 ## 设置为"false"时删除PVC不会保留数据,"true"则保留数据
#mountOptions: 
#  - hard                                                  ## 指定为硬挂载方式
#  - nfsvers=4                                             ## 指定NFS版本,这个需要根据NFS Server版本号设置
```