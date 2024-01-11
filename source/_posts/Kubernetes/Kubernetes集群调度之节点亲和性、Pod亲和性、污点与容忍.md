---
title: Kubernetes集群调度之节点亲和性、Pod亲和性、污点与容忍
abbrlink: aec8a52c
cover: 'https://static.zahui.fan/images/202211212221065.svg'
categories:
  - Kubernetes
tags:
  - Scheduler
date: 2022-04-30 23:36:30
---

## 调度器

Scheduler 是 Kubernetes 的调度器，主要的任务是把定义的 pod 分配到集群的节点上。听起来非常简单，但有很多要考虑的问题：

- 公平：如何保证每个节点都能被分配资源
- 资源高效利用：集群所有资源最大化被使用
- 效率：调度的性能要好，能够尽快地对大批量的 pod 完成调度工作
- 灵活：允许用户根据自己的需求控制调度的逻辑k

Scheduler 是作为单独的程序运行的，启动之后会一直监听 API Server，获取PodSpec.NodeName为空的 pod，对每个 pod 都会创建一个 binding（必须遵守的），表明该 pod 应该放到哪个节点上

### 调度过程

调度分为几个步骤：

1. 首先是过滤掉不满足条件的节点，这个过程称为predicate（预选）；
2. 然后对通过的节点按照优先级排序，这个是priority（优选）；
3. 最后从中选择优先级最高的节点。

Predicate（预选）有一系列的算法可以使用：

| 算法               | 说明                                                               |
| ------------------ | ------------------------------------------------------------------ |
| PodFitsResources   | 节点上剩余的资源是否大于 pod 请求的资源                            |
| PodFitsHost        | 如果 pod 指定了 NodeName，检查节点名称是否和 NodeName 匹配         |
| PodFitsHostPorts   | 节点上已经使用的 port 是否和 pod 申请的 port 冲突                  |
| PodSelectorMatches | 过滤掉和 pod 指定的 label 不匹配的节点                             |
| NoDiskConflict     | 已经 mount 的 volume 和 pod 指定的 volume 不冲突，除非它们都是只读 |

如果在 predicate 过程中没有合适的节点，pod 会一直在pending状态，不断重试调度，直到有节点满足条件。经过这个步骤，如果有多个节点满足条件，就继续 priorities 过程：按照优先级大小对节点排序

**优先级由一系列键值对组成，键是该优先级项的名称，值是它的权重（该项的重要性）。这些优先级选项包括：**

| 算法                       | 说明                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| LeastRequestedPriority     | 通过计算 CPU 和 Memory 的使用率来决定权重，使用率越低权重越高。换句话说，这个优先级指标倾向于资源使用比例更低的节点 |
| BalancedResourceAllocation | 节点上 CPU 和 Memory 使用率越接近，权重越高。这个应该和上面的一起使用，不应该单独使用                               |
| ImageLocalityPriority      | 倾向于已经有要使用镜像的节点，镜像总大小值越大，权重越高                                                            |

通过算法对所有的优先级项目和权重进行计算，得出最终的结果

## 节点亲和性

pod.spec.nodeAffinity

- preferredDuringSchedulingIgnoredDuringExecution（优先执行计划）：软策略
- requiredDuringSchedulingIgnoredDuringExecution（要求执行计划）：硬策略

键值运算关系

| 运算符       | 说明                     |
| ------------ | ------------------------ |
| In           | label 的值在某个列表中   |
| NotIn        | label 的值不在某个列表中 |
| Gt           | label 的值大于某个值     |
| Lt           | label 的值小于某个值     |
| Exists       | 某个 label 存在          |
| DoesNotExist | 某个 label 不存在        |

标签操作

```bash
# 查看label
kubectl get node --show-labels

# 添加label
kubectl label nodes 192.168.15.182 nodetype=hci

# 删除label
kubectl label nodes 192.168.15.182 nodetype-

# 修改label
kubectl label nodes 192.168.15.182 nodetype=vmware --overwrite
```

### 硬策略：requiredDuringSchedulingIgnoredDuringExecution

```bash
#节点硬策略。排除node02，只能在node01上运行
apiVersion: v1
kind: Pod
metadata:
  name: affinity
  labels:
    app: node-affinity-pod
spec:
  containers:
  - name: with-node-affinity
    image: hub.atguigu.com/library/myapp:v1
  affinity:            #亲和性
    nodeAffinity:        #node亲和性
      # 硬亲和性限制
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname # 标签键名
            operator: NotIn      #键值运算关系 ，NotIn:label的值不在某个列表中。 表示不是node02节点就可运行
            values:
            - k8s-node02 # 标签键值
```

### 软策略：preferredDuringSchedulingIgnoredDuringExecution

如果有的话就在上面运行，没有的话就算了

```yml
#软策略
apiVersion: v1
kind: Pod
metadata:
  name: affinity2
  labels:
    app: node-affinity-pod
spec:
  containers:
  - name: with-node-affinity
    image: hub.atguigu.com/library/myapp:v1
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1   #权重，权重越大越亲和(多个软策略的情况)
        preference: 
          matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
            - k8s-node03  # 期望是node03
```

### 软硬策略（先满足硬策略再满足软策略）

```yml
#软硬合体
apiVersion: v1
kind: Pod
metadata:
  name: affinity2
  labels:
    app: node-affinity-pod
spec:
  containers:
  - name: with-node-affinity
    image: hub.atguigu.com/library/myapp:v1
  affinity:
    nodeAffinity:        #node亲和性
      # 硬亲和性限制
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname # 标签键名
            operator: NotIn      #键值运算关系 ，NotIn:label的值不在某个列表中。 表示不是node02节点就可运行
            values:
            - k8s-node02 # 标签键值
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1   #权重，权重越大越亲和(多个软策略的情况)
        preference: 
          matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
            - k8s-node03  # 期望是node03
```

## Pod亲和性（pod与pod之间的亲和性）

pod.spec.affinity.podAffinity/podAntiAffinity

- preferredDuringSchedulingIgnoredDuringExecution：软策略
- requiredDuringSchedulingIgnoredDuringExecution：硬策略

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-3
  labels:
    app: pod-3
spec:
  containers:
  - name: pod-3
    image: hub.atguigu.com/library/myapp:v1
  affinity:
    #想让两个pod运行在同一个node上
    podAffinity:
      #硬策略
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:  #标签选择
          matchExpressions:
          - key: app #当app存在node-affinity-pod时就选择
            operator: In
            values: 
            - node-affinity-pod
        topologyKey: kubernetes.io/hostname 
        #hostname判断是否在同一个pod，唯一

```

```yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-4
  labels:
    app: pod-4
spec:
  containers:
  - name: pod-4
    image: hub.atguigu.com/library/myapp:v1
  affinity:
    #不想让两个pod运行在同一个node上
    #匹配标签如果app=pod-2，那么则不运行在这个节点
    podAntiAffinity:
      #软策略
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app #匹配app=node-affinity-pod
              operator: In
              values:
              - node-affinity-pod
          topologyKey: kubernetes.io/hostname
```

## Taint 和 Toleration

节点亲和性，是pod的一种属性（偏好或硬性要求），它使pod被吸引到一类特定的节点。Taint 则相反，它使节点能够排斥一类特定的 pod

Taint 和 toleration 相互配合，可以用来避免 pod 被分配到不合适的节点上。每个节点上都可以应用一个或多个taint ，这表示对于那些不能容忍这些 taint 的 pod，是不会被该节点接受的。如果将 toleration 应用于 pod上，则表示这些 pod 可以（但不要求）被调度到具有匹配 taint 的节点上

### 污点 (Taint)

#### 1、污点 ( Taint ) 的组成

使用kubectl taint命令可以给某个 Node 节点设置污点，Node 被设置上污点之后就和 Pod 之间存在了一种相斥的关系，可以让 Node 拒绝 Pod 的调度执行，甚至将 Node 已经存在的 Pod 驱逐出去每个污点的组成如下：

`key=value:effect`

每个污点有一个 key 和 value 作为污点的标签，其中 value 可以为空，effect 描述污点的作用。当前 taint effect 支持如下三个选项：

| 污点类型         | 含义                                                            |
| ---------------- | --------------------------------------------------------------- |
| NoSchedule       | 新的不能容忍的pod不能再调度过来，但是老的运行在node上不受影响   |
| PreferNoSchedule | 同时会将Node上已经存在的Pod驱逐出去, pod会尝试将pod分配到该节点 |
| NoExecute        | 新的不能容忍的pod不能调度过来，老的pod也会被驱逐                |

#### 2、污点的设置、查看和去除

```bash
#查看节点污点
kubectl describe node k8s-node01

# 设置污点
kubectl taint nodes node1 key1=value1:NoSchedule

# 节点说明中，查找 Taints 字段
kubectl describe node k8s-node01

# 去除污点
kubectl taint nodes node1 key1:NoSchedule-
```

### 容忍(Tolerations)

设置了污点的 Node 将根据 taint 的 effect：NoSchedule、PreferNoSchedule、NoExecute 和 Pod 之间产生互斥的关系，Pod 将在一定程度上不会被调度到 Node 上。但我们可以在 Pod 上设置容忍 ( Toleration ) ，意思是设置了容忍的 Pod 将可以容忍污点的存在，可以被调度到存在污点的 Node 上

pod.spec.tolerations

```yml
tolerations:                # containers同级
- key: "disk_type"          # 能容忍的污点key
  operator: "Equal"         # Equal 表示key=value ， Exists 只要存在key即可
  value: "SSD"              # 值
  effect: "NoExecute"       # effect策略
  tolerationSeconds: 3600   # 原始的pod多久驱逐,单位是秒，注意只有effect: "NoExecute"才能设置，不然报错
```

> 其中 key, vaule, effect 要与 Node 上设置的 taint 保持一致
> operator 的值为 Exists 将会忽略 value 值

#### 1、当不指定 key 值时，表示容忍所有的污点 key

```yml
tolerations:
- operator: "Exists"
```

#### 2、当不指定 effect 值时，表示容忍所有的污点作用

```yml
tolerations:
- key: "key"
  operator: "Exists"
```

## 指定调度节点

亲和性和污点，容忍都比较含蓄。
指定调度节点是绝对指定目标，就要这个

### Pod.spec.nodeName

将 Pod 直接调度到指定的 Node 节点上，会跳过 Scheduler 的调度策略，该匹配规则是强制匹配

```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: myweb
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: myweb
    spec:
      nodeName: k8s-node01          # 指定全在k8s-node01
      containers:
      - name: myweb
        image: hub.atguigu.com/library/myapp:v1
        ports:
        - containerPort: 80
```

### Pod.spec.nodeSelector

通过 kubernetes 的 label-selector 机制选择节点，由调度器调度策略匹配 label，而后调度 Pod 到目标节点，该匹配规则属于强制约束

```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: myweb66
spec:
  replicas: 2
  template:
    metadata:
      labels:
        app: myweb66
  spec:
    nodeSelector:
      disk: ssd                 # 硬盘必须是ssd类型才运行
      # type: backEndNode1      # 标签名，标签值
    containers:
    - name: myweb66
      image: hub.atguigu.com/library/myapp:v1
      ports:
      - containerPort: 80
```
