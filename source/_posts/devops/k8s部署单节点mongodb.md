---
title: k8s部署单节点mongodb
categories:
  - devops
abbrlink: 894ed04d
date: 2024-01-02 14:17:58
tags:
---

**根据yaml文件修改**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongo-config
  namespace: public
data:
  mongodb.conf: |-
    dbpath=/data/mongodb
    #logpath=/data/mongodb/mongodb.log
    pidfilepath=/data/mongodb/master.pid
    directoryperdb=true
    logappend=true
    bind_ip=0.0.0.0
    port=27017

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: public
spec:
  replicas: 1
  serviceName: mongodb
  selector:
    matchLabels:
      name: mongodb
  template:
    metadata:
      labels:
        name: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:4.2.1
        command:
        - sh
        - -c
        - "exec mongod -f /data/mongodb/conf/mongodb.conf"
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 27017
          name: mongodb
          protocol: TCP
        volumeMounts:
        - name: mongo-config
          mountPath: /data/mongodb/conf/
        - name: data
          mountPath: /data/mongodb/
      volumes:
      - name: mongo-config
        configMap:
          name: mongo-config
      - name: data
        hostPath:
          path: /data/mongodb/

---
kind: Service
apiVersion: v1
metadata:
  labels:
    name: mongodb
  name: mongodb
  namespace: public
spec:
  ports:
  - name: mongodb
    port: 27017
    targetPort: 27017
  selector:
    name: mongodb
```
*登录mongodb创建库和用户*

```shell
db.auth('root','1VklxvchenD1x')
show dbs
use test
db.test.insert({name:"John",age:25})

# 创建test用户并授权
test = db.getSiblingDB('test');
test.createUser({user: "test",pwd: "test123",roles: [{ role: "dbOwner", db: "test" }]});

```