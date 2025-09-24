---
title: Prometheus常用PromSQL记录
cover: 'https://s3.babudiu.com/iuxt//images/202211212208509.svg'
categories:
  - 监控
tags:
  - Prometheus
  - prometheus
abbrlink: 11255f25
date: 2022-12-06 14:47:09
---

prometheus查询语法叫promsql，做个记录：

## 查询条件

Prometheus 存储的是时序数据，而它的时序是由名字和一组标签构成的，其实名字也可以写出标签的形式，例如 `http_requests_total` 等价于 `{name="http_requests_total"}`。

一个简单的查询相当于是对各种标签的筛选，例如：

```bash
http_requests_total{code="200"}     # 表示查询名字为 http_requests_total，code 为 "200" 的数据
http_requests_total{code!="200"}    # 表示查询 code 不为 "200" 的数据
http_requests_total{code=~"2.."}    # 表示查询 code 为 "2xx" 的数据
http_requests_total{code!~"2.."}    # 表示查询 code 不为 "2xx" 的数据
```

## 操作符

Prometheus 查询语句中，支持常见的各种表达式操作符，例如

### 算术运算符

支持的算术运算符有 `+，-，*，/，%，^` , 例如 `http_requests_total * 2` 表示将 http_requests_total 所有数据 double 一倍。

### 比较运算符

支持的比较运算符有 `==，!=，>，<，>=，<=` , 例如 `http_requests_total > 100` 表示 http_requests_total 结果中大于 100 的数据。

### 逻辑运算符

支持的逻辑运算符有 `and，or，unless`, 例如 `http_requests_total == 5 or http_requests_total == 2` 表示 http_requests_total 结果中等于 5 或者 2 的数据。

### 聚合运算符

支持的聚合运算符有 `sum，min，max，avg，stddev，stdvar，count，count_values，bottomk，topk，quantile` , 例如 `max(http_requests_total)` 表示 http_requests_total 结果中最大的数据。

注意，和四则运算类型，Prometheus 的运算符也有优先级，它们遵从`(^)> (*, /, %) > (+, -) > (==, !=, <=, <, >=, >) > (and, unless) > (or)` 的原则。

## 内置函数

### 取整

```bash
floor(avg(http_requests_total{code="200"}))       # 往小了取值
ceil(avg(http_requests_total{code="200"}))        # 往大了取值
```

### 速率

查看 http_requests_total 5分钟内，平均每秒数据

```bash
rate(http_requests_total[5m])
irate(http_requests_total[5m])
```

### 平均值

```bash
avg()       # 平均值
max()       # 最大值
min()       # 最小值
abs()       # 绝对值
increase()  # 增量
```

更多请查看官方文档：<https://prometheus.io/docs/prometheus/latest/querying/functions/>

## 聚合

### 求和

> sum是求和， sum by (app, proc)是把数据以app和proc聚合 分类来求和， 结果会带上这两个标签

```bash
sum by (app, proc) (
  instance_memory_limit_bytes - instance_memory_usage_bytes
) / 1024 / 1024
```

### 计数

> 类似于 `wc -l`

```bash
count by (app) (instance_cpu_time_ns)
```
