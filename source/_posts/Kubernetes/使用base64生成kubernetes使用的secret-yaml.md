---
title: 使用base64生成kubernetes使用的secret yaml
categories:
  - Kubernetes
tags:
  - k8s
  - base64
abbrlink: 462d0642
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
date: 2022-11-04 15:47:52
---

先申请证书, 证书申请下来后会有 证书(一般都是pem后缀或者crt后缀) 和 私钥(一般后缀是key)

使用base64加工一下:

```bash
base64 /mnt/c/Users/iuxt/Desktop/lexus.ald.vrzbq.com_nginx/lexus.ald.vrzbq.com_bundle.crt -w 0
```

> -w 0 的意思是不换行, 默认是76个字符换行.

然后填到Kubernetes的yaml文件里面即可.

```yml
apiVersion: v1
data:
  tls.crt: <单行文本证书>
  tls.key: <单行文本key>
kind: Secret
metadata:
  name: lexus-ald-ingeek-com
  namespace: prod-valet
type: kubernetes.io/tls
```
