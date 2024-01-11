---
title: Kubernetes使用NFS作为存储
abbrlink: 179eb842
cover: 'https://static.zahui.fan/images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - Kubernetes
  - NFS
date: 2022-03-06 22:10:30
---

我们玩单机的容器，如果需要持久化的话，需要将容器目录映射到主机，但是在K8S环境下容器是可能会被调度到任意节点的，所以需要使用远程服务存储数据。在云平台上都会提供自己的云盘存储，但是自己搭建的Kubernetes没有办法使用云盘做存储，所以需要用自己搭建的存储，NFS是比较常见的一种，其他还有glusterfs、ceph等。

> 关于NFS搭建教程，可以查看<https://zahui.fan/posts/4b677f68/>
> 容器镜像开源地址<https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner>

## 安装NFS client工具

所有的worker节点上都需要安装NFS client

- Ubuntu

    ```bash
    sudo apt install nfs-common -y
    ```

- CentOS

    ```bash
    sudo yum install nfs-utils -y
    ```

## rbac授权

rbac.yml

```yml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: default
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
    # replace with namespace where provisioner is deployed
    namespace: default
roleRef:
  kind: ClusterRole
  name: nfs-client-provisioner-runner
  apiGroup: rbac.authorization.k8s.io
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: default
rules:
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: default
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    # replace with namespace where provisioner is deployed
    namespace: default
roleRef:
  kind: Role
  name: leader-locking-nfs-client-provisioner
  apiGroup: rbac.authorization.k8s.io

```

```bash
kubectl apply -f rbac.yml
```

```bash
kubectl get sa
NAME                     SECRETS   AGE
default                  1         2d
nfs-client-provisioner   1         5s
```

## 部署插件

deployment.yaml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nfs-client-provisioner
  labels:
    app: nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: default
spec:
  replicas: 1
  strategy:
    type: Recreate
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
          image: registry.cn-hangzhou.aliyuncs.com/iuxt/nfs-subdir-external-provisioner:v4.0.2
          volumeMounts:
            - name: nfs-client-root
              mountPath: /persistentvolumes
          env:
            - name: PROVISIONER_NAME
              # 必须与class.yaml中的provisioner的名称一致
              value: iuxt/nfs
            - name: NFS_SERVER
              # NFS服务器的ip地址
              value: 10.0.0.3
            - name: NFS_PATH
              # 修改为实际创建的共享挂载目录
              value: /nfs
      volumes:
        - name: nfs-client-root
          nfs:
            # NFS服务器的ip地址
            server: 10.0.0.3
            # 修改为实际创建的共享挂载目录
            path: /nfs
```

```bash
kubectl apply -f deployment.yml
```

```bash
kubectl get deploy
NAME                                   READY   UP-TO-DATE   AVAILABLE   AGE
nfs-client-provisioner                 1/1     1            1           10s
```

## 创建storageclass

storageclass.yml

```yml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: managed-nfs-storage
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
# 必须与deployment.yaml中的PROVISIONER_NAME一致
provisioner: iuxt/nfs
mountOptions:
  - vers=4.1
parameters:
  archiveOnDelete: "false"
```

```bash
kubectl apply -f storageclass.yml
```

```bash
kubectl get sc
NAME                  PROVISIONER         RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
managed-nfs-storage   iuxt/nfs            Delete          Immediate           false                  15s
```

## 测试NFS

nginx.yml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: test-nginx
  template:
    metadata:
      labels:
        app: test-nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
          - mountPath: /usr/share/nginx/html
            name: data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: nfs

---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
 name: nfs
 annotations:
   volume.beta.kubernetes.io/storage-class: "managed-nfs-storage"
spec:
 accessModes:
   - ReadWriteMany
 resources:
   requests:
     storage: 1Gi

---
apiVersion: v1
kind: Service
metadata:
  name: test-nginx
  labels:
    app: test-nginx
spec:
  ports:
  - port: 80
    protocol: TCP
  selector:
    app: test-nginx
```

```bash
kubectl apply -f nginx.yml
```

然后在NFS服务器上可以看到对应的目录，进去创建一个index.html文件，然后再请求对应的容器，发现已经可以正常返回了。

## 常见问题

### PVC一直处于Pending状态

```bash
kubectl describe pvc

# 发现报错
  Normal  ExternalProvisioning  8s (x2 over 13s)  persistentvolume-controller  waiting for a volume to be created, either by external provisioner "qgg-nfs-storage" or manually created by system administrator
```

> 如果你是使用的这个镜像 `image: quay.io/external_storage/nfs-client-provisioner:latest` 这个镜像是老镜像了，1.20及以上版本的K8S会报错，这是因为Kubernetes v1.20开始，默认删除了 > `metadata.selfLink` 字段，然而，部分应用仍然依赖于这个字段，例如 `nfs-client-provisioner`。如果仍然要继续使用这些应用，您将需要重新启用该字段。
> 通过配置 apiserver 启动参数中的 `--feature-gates` 中的 `RemoveSelfLink=false`，可以重新启用 `metadata.selfLink` 字段。
> 具体来说，如果您使用 kubeadm 安装 Kubernetes，请修改 `/etc/kubernetes/manifests/kube-apiserver.yaml` 文件，并在其启动参数中增加一行 `- --feature-gates=RemoveSelfLink=false`

在所有的Master节点上修改配置

```yml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    kubeadm.kubernetes.io/kube-apiserver.advertise-address.endpoint: 10.0.0.11:6443
  creationTimestamp: null
  labels:
    component: kube-apiserver
    tier: control-plane
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - command:
    - kube-apiserver
    - --advertise-address=10.0.0.11
    - --allow-privileged=true
    - --authorization-mode=Node,RBAC
    - --client-ca-file=/etc/kubernetes/pki/ca.crt
    - --enable-admission-plugins=NodeRestriction
    - --enable-bootstrap-token-auth=true
    - --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt
    - --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt
    - --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key
    - --etcd-servers=https://127.0.0.1:2379
    - --insecure-port=0
    - --kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt
    - --kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key
    - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
    - --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.crt
    - --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client.key
    - --requestheader-allowed-names=front-proxy-client
    - --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt
    - --requestheader-extra-headers-prefix=X-Remote-Extra-
    - --requestheader-group-headers=X-Remote-Group
    - --requestheader-username-headers=X-Remote-User
    - --secure-port=6443
    - --service-account-issuer=https://kubernetes.default.svc.cluster.local
    - --service-account-key-file=/etc/kubernetes/pki/sa.pub
    - --service-account-signing-key-file=/etc/kubernetes/pki/sa.key
    - --service-cluster-ip-range=10.96.0.0/12
    - --tls-cert-file=/etc/kubernetes/pki/apiserver.crt
    - --tls-private-key-file=/etc/kubernetes/pki/apiserver.key
    - --feature-gates=RemoveSelfLink=false
    image: k8s.gcr.io/kube-apiserver:v1.21.10
    ...
```

或者更换镜像为 `k8s.gcr.io/sig-storage/nfs-subdir-external-provisioner:v4.0.2`，国内加速镜像为：`registry.cn-hangzhou.aliyuncs.com/iuxt/nfs-subdir-external-provisioner:v4.0.2`
