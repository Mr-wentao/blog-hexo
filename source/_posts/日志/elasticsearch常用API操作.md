---
title: Elasticsearch常用API操作
abbrlink: ee708f6b
description: Elasticsearch常用API操作，比如通过api进行查看索引、删除索引、增加用户、修改密码等。
categories:
  - 日志
tags:
  - ElasticSearch
  - Log
cover: 'https://static.zahui.fan/public/elasticsearch.svg'
date: 2022-04-25 10:26:56
---


如果有Kibana的话，以下所有操作都可以在Kibana的DevTools页面进行调试，可以免去认证操作。

![Kibana调试查看索引接口](https://static.zahui.fan/images/20220425224238.png)



| 接口           | 功能         |
| -------------- | ------------ |
| `/_cat/health?v` | 集群健康状态 |
| `/_cat/shards`   | 分片信息     |
| `/_cat/nodes`    | 节点信息     |
| `/_cat/indices`  | 索引信息     |

`?v` 是详细信息输出



## 删除索引

```bash
curl -u elastic:xlFnyMMyZiqjkzLIV5Kd -s -XDELETE 192.168.13.127:9200/索引名字
```

> 索引名字可以通过查看索引接口查看

## 修改密码

```bash
curl -H "Content-Type:application/json" -XPOST -u elastic:xlFnyMMyZiqjkzLIV5Kd 'http://127.0.0.1:9200/_xpack/security/user/elastic/_password' -d '{ "password" : "123456" }'
```

## 添加角色

```bash
curl -XPOST -H 'Content-type: application/json' -u elastic:xlFnyMMyZiqjkzLIV5Kd 'http://10.163.19.231:9600/_xpack/security/role/admin?pretty' -d '{
"run_as":["elastic"],
"cluster":["all"],
"indices":[
 {
  "names":["*"],
  "privileges":["all"]
 }
]
}'
```

## 查看角色

```bash
curl -XGET -H 'Content-type: application/json' -u elastic:xlFnyMMyZiqjkzLIV5Kd 'http://10.163.19.231:9600/_xpack/security/role/admin?pretty'
```

## 允许自动创建索引

```bash
curl -XPUT -H "Content-Type:application/json" -u "admin:8zQq0F2ljEFlw2Rt" https://10.184.127.192:9200/_cluster/settings -d '{"persistent":{"action.auto_create_index":"true"}}' -k
```

## 查看设置

```bash
curl -XGET -u "admin:8zQq0F2ljEFlw2Rt" https://10.184.127.192:9200/_cluster/settings -k
```

## 修改设置

```bash
curl -u elastic:n9TQmAu3Ws4huJRmAVDq 10.252.4.90:9200/_cluster/settings -X PUT -H "Content-Type: application/json" -d '{
  "persistent" : {
    "cluster" : {
      "max_shards_per_node" : "900000"
    },
    "indices" : {
      "breaker" : {
        "total" : {
          "limit" : "95%"
        }
      }
    },
    "xpack" : {
      "monitoring" : {
        "collection" : {
          "enabled" : "true"
        }
      }
    }
  }

}'
```
### 修改单个node最大分片数

```bash
# es 支持永久修改配置与临时修改配置, 如果想要临时修改:  "transient" : {"cluster" : {"max_shards_per_node" : "900000"}}
curl -X PUT localhost:9200/_cluster/settings -H "Content-Type: application/json" -d '{ "persistent": { "cluster.max_shards_per_node": "3000" } }'

# 查看未分配的分片数
curl -XGET http://localhost:9200/_cluster/health\?pretty | grep unassigned_shards
```

