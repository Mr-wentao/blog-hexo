---
title: 批量更新k8s中使用的域名证书
categories:
  - Kubernetes
tags:
  - Kubernetes
---


### 脚本如下

```shell
#!/bin/bash
source /etc/rc.d/init.d/functions
set -euo pipefail
export PATH=/opt/kube/bin:$PATH

secret_name=test-com
cert_name=test.com.crt
key_name=test.com.key

if [ "$#" == 0 ];then
  for ns in `kubectl get ns|grep -v "NAME\|kube-*"|awk '{print $1}'`;do
    kubectl create secret tls $secret_name --cert=$cert_name --key=$key_name -n $ns --dry-run=client -o yaml |kubectl apply -f -
    action $ns true
  done
else
  for ns in $@;do
    kubectl create secret tls $secret_name --cert=$cert_name --key=$key_name -n $ns --dry-run=client -o yaml |kubectl apply -f -
    action $ns true
  done
fi

```