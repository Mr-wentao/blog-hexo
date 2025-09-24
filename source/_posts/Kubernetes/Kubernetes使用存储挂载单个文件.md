---
title: Kubernetes使用存储挂载单个文件
categories:
  - Kubernetes
tags:
  - Kubernetes
  - 挂载
  - 配置记录
abbrlink: lq292e56
date: 2023-12-12 19:19:07
---

一般来说, 挂载存储都是把一个PV挂载到一个路径, 挂载后此路径下原来的文件就会不见, 只能看到挂载后的文件, 和在Linux下挂载磁盘是一样的. 那么现在有个需求: 

## 需求

此服务是java程序, 数据库使用的是内嵌的h2 database, 下图中的两个文件就是数据库的文件. 这两个文件是存在于根目录下的, 假设此程序数据库文件是代码写死的(真实情况是: 数据库路径是可以更改的), 现在要部署到kubernetes中, 并对数据库做持久化.
![image.png](https://s3.babudiu.com/iuxt//images/202312121923294.png)

## 使用subpath

根据之前挂载configmap到单个文件的经验, 我们应该使用subpath来挂载, 先创建好pvc, yml如下

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: metabase-pvc
spec:
  storageClassName: managed-nfs-storage
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```


statefulset的配置

```yaml
spec:
  replicas: 1
  serviceName: "metabase"
  selector:
    matchLabels:
      app: metabase
  template:
    metadata:
      labels:
        app: metabase
    spec:
      containers:
      - image: registry.cn-hangzhou.aliyuncs.com/iuxt/metabase:test
        name: metabase
        volumeMounts:
        - name: metabase-pv
          mountPath: /metabase.db.mv.db
          subPath: metabase.db.mv.db
        - name: metabase-pv
          mountPath: /metabase.db.trace.db
          subPath: metabase.db.trace.db
      volumes:
        - name: metabase-pv
          persistentVolumeClaim:
            claimName: metabase-pvc
```

但是这样挂载后, 容器内的metabase.db.mv.db和metabase.db.trace.db是目录, 并不是文件, 程序也自然无法启动. 

## subpath原理

下面是绑定 subPath 的源码部分，我们可以看到下面的 `t.Model()&os.ModeDir` 部分，如果 `subPath` 是一个文件夹的话就会去创建这个文件夹，如果是文件的话就进行单独挂载。

```go
func doBindSubPath(mounter Interface, subpath Subpath, kubeletPid int) (hostPath string, err error) {
    ...
    // Create target of the bind mount. A directory for directories, empty file
    // for everything else.
    t, err := os.Lstat(subpath.Path)
    if err != nil {
        return "", fmt.Errorf("lstat %s failed: %s", subpath.Path, err)
    }
    if t.Mode() & os.ModeDir > 0 {
        if err = os.Mkdir(bindPathTarget, 0750); err != nil && !os.IsExist(err) {
            return "", fmt.Errorf("error creating directory %s: %s", bindPathTarget, err)
        }
    } else {
        // "/bin/touch <bindDir>".
        // A file is enough for all possible targets (symlink, device, pipe,
        // socket, ...), bind-mounting them into a file correctly changes type
        // of the target file.
        if err = ioutil.WriteFile(bindPathTarget, []byte{}, 0640); err != nil {
            return "", fmt.Errorf("error creating file %s: %s", bindPathTarget, err)
        }
    }
    ...
}
```

那么我们可不可以通过手动创建好文件来实现需求, 答案是可以的. 你可以自己测试下, 但是在存储中手动创建文件也太不优雅了..

## 使用init container来自动创建空文件

init container非常适合来做这件事, 那么完整的yaml文件如下:

```yml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    name: metabase-StatefulSet
  name: metabase
spec:
  replicas: 1
  serviceName: "metabase"
  selector:
    matchLabels:
      app: metabase
  template:
    metadata:
      labels:
        app: metabase
    spec:
      initContainers:
      - name: init
        image: busybox:1.28
        command: ['sh', '-c', "touch /metabase/metabase.db.mv.db /metabase/metabase.db.trace.db"]
        volumeMounts:
        - name: metabase-pv
          mountPath: /metabase
      volumes:
        - name: metabase-pv
          persistentVolumeClaim:
            claimName: metabase-pvc
      containers:
      - image: registry.cn-hangzhou.aliyuncs.com/iuxt/metabase:test
        name: metabase
        ports:
        - containerPort: 3000
          protocol: TCP

        volumeMounts:
        - name: metabase-pv
          mountPath: /metabase.db.mv.db
          subPath: metabase.db.mv.db
        - name: metabase-pv
          mountPath: /metabase.db.trace.db
          subPath: metabase.db.trace.db
        - name: metabase-pv
          mountPath: /metabase/plugins
          subPath: plugins
      volumes:
        - name: metabase-pv
          persistentVolumeClaim:
            claimName: metabase-pvc
---
kind: Service
apiVersion: v1
metadata:
  labels:
    app: metabase
  name: metabase
spec:
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: metabase
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: metabase
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: intranet
  tls:
  - hosts:
    - metabase.i.com
    secretName: i-com
  rules:
  - host: metabase.i.com
    http:
      paths:
      - path: /
        pathType: ImplementationSpecific
        backend:
          service:
            name: metabase
            port:
              number: 3000
```

这样完美解决了问题, 并且不会影响到目录下的其他文件.