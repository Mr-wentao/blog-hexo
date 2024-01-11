---
title: k8s配置ingress访问集群外部资源
tags: k8s配置ingress访问集群外部资源
categories:
  - devops
abbrlink: 49c855ea
---

**使用ingress访问外部资源，首先需要创建service指向我们需要访问的资源
而每个service包含一个endpoint**

```
endpoint是k8s集群中的一个资源对象，存储在etcd中，用来记录一个service对应的所有pod的访问地址。service配置selector，endpoint controller才会自动创建对应的endpoint对象；否则，不会生成endpoint对象.
```
**endpoint和对应service的yaml文件**

```yaml
kind: Endpoints
apiVersion: v1
metadata:
  # 此处 metadata.name 的值要和 service 中的 metadata.name 的值保持一致
  # endpoint 的名称必须和服务的名称相匹配
  name: kibana
  namespace: public
subsets:
  - addresses:
      # 服务将连接重定向到 endpoint 的 IP 地址
      - ip: 172.20.10.4
    ports:
      # 外部服务端口
      # endpoint 的目标端口
      - port: 5601
---
apiVersion: v1
kind: Service
metadata:
  # 此处 metadata.name 的值要和 endpoints 中的 metadata.name 的值保持一致
  name: kibana
  # 外部服务服务统一在固定的名称空间中
  namespace: public
spec:
  type: NodePort
  ports:
    - protocol: TCP
      port: 5601
      targetPort: 5601

```
*创建完成后在使用ingress配置域名或者ip就可以访问了，也可以直接使用nodeport访问*

