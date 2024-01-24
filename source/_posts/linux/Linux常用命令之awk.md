---
title: Linux常用命令之awk
abbrlink: c4a2fe4
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - Command
date: 2021-03-14 21:59:48
---

## awk 多个分隔符

```bash
echo "abcdefg" | awk -F '[ce]' '{print $1,$2,$3}'
ab d fg
```

> 但是我想要提取dmesg里面的时间，想以`[]`来做分割，这个时候可以反写`[]`取个巧

```bash
dmesg | awk -F '[][]' '{print $2}'
```

## 打印某一列为特定值的行

```bash
awk '$8=="500"' nginx_access.log
```

## awk 交换一个文件的两列

比如文件`test.txt`

```txt
a;b;c
d;e;f
1;2;3
4;5;6
```

### 方法1

```bash
awk -F ';' '{printf("%s;%s;%s\n",$3,$2,$1)}' test.txt
```

### 方法2

```bash
awk -F ';' '{temp = $3 ; $3 = $1; $1 = temp}1' OFS=';' test.txt

这里的1 和 {print}是一样的, OFS代表分隔符。
```

## 找出某一列是指定值的行

比如我想知道根目录的磁盘占用情况

```bash
Filesystem     Type      Size  Used Avail Use% Mounted on
/dev/sdc       ext4      251G   13G  226G   6% /
none           tmpfs     3.9G   68K  3.9G   1% /mnt/wslg
none           tmpfs     3.9G  4.0K  3.9G   1% /mnt/wsl
```

```bash
df -hT | awk '($NF=="/"){print $(NF - 1)}'
# $(NF - 1) 倒数第二列
```

输出结果为：

6%

## awk多个条件判断

原始输出:

```bash
[root@qz_k8s_m1 data]# kubectl get pod -n dev
NAME                                              READY   STATUS    RESTARTS   AGE
idp-dks-7b47f8cccb-cwdfw                          1/1     Running   0          3h28m
idp-kts-6c5bbd4f49-ns74j                          0/1     Running   92         6h55m
idp-kts-7c78fbdf68-cg28l                          1/1     Running   0          8d
```

```bash
# 找出其中未就绪且重启次数大于10次的pod
[root@qz_k8s_m1 data]# kubectl get pod -n dev | awk '($2=="0/1" && $4>10)'
idp-kts-6c5bbd4f49-ns74j                          0/1     Running   93         6h57m

# 可以只打印pod名字
[root@qz_k8s_m1 data]# kubectl get pod -n dev | awk '($2=="0/1" && $4>20) {print $1}'
idp-kts-6c5bbd4f49-ns74j
```
