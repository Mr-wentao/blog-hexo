---
title: 使用kubectl进行多集群管理
categories:
  - Kubernetes
tags:
  - kubectl
  - Kubernetes
  - 权限管理
  - 配置记录
abbrlink: lqacdmqv
date: 2023-12-18 11:13:59
---
平常使用跳板机来管理, 经常多个环境多套集群, 那么如何用一个kubectl如何管理这些集群.

## 使用不同的kubeconfig管理

### 使用不同的Linux用户

每个Linux用户的 `~/.kube/config` 配置不同即可, 比如创建一个uat用户,一个prod用户, 分别配置不同的config文件

### 使用环境变量

config文件放到当前目录下
```bash
KUBECONFIG=config-uat kubectl get pod
```
环境变量也可以写成全局的在.bashrc里面

```sh
export KUBECONFIG=config-uat
```

### 使用参数

同使用环境变量
```bash
kubectl get pod --kubeconfig=config-uat
```


## 使用一个kubeconfig

### 准备

确保每个kubeconfig里面部分参数唯一性,可以手动修改一下

![image.png](https://s3.babudiu.com/iuxt//images/202312181126408.png)

### 合并配置文件

假设一个配置文件名为: uat, 另一个为: prod

```bash
KUBECONFIG=uat:prod kubectl config view --flatten > merged-kubeconfig
```

### 验证合并结果

完成合并后，可以使用以下命令验证新的 kubeconfig 文件是否包含了所有的集群、用户和上下文定义, 如果上面没有保证唯一性, 那么合并后的配置就是不完整的.

```bash
kubectl config view --kubeconfig=merged-kubeconfig
```

### 使用配置文件

除了指定配置文件外(如果配置文件放到~/.kube/config内,不需要加--kubeconfig参数)
```bash
# 切换到uat集群, 配置会保存到配置文件(下次默认就是uat集群了)
kubectl config use-context uat --kubeconfig=merged-kubeconfig

# 切换到prod集群
kubectl config use-context prod --kubeconfig=merged-kubeconfig
```
