---
title: Kafka常用操作记录
abbrlink: 12ab226e
categories:
  - 日志
tags:
  - Kafka
  - MQ
  - 配置记录
date: 2022-04-15 12:20:14
---

经常用到的Kafka命令记录以下，方便查找。kafka的搭建可以参考这篇文章[Kafka和zookeeper搭建](/posts/60a9e345)

{% note warning simple %}
注意: --bootstrap-server 参数配置的kafka地址需要根据kafka监听地址来判断, 如果监听的是自己的ip而不是0.0.0.0, 那就不要配置localhost, 改用ip地址.
{% endnote %}

## Topic操作

```bash
# 创建topic
bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --replication-factor 1 --partitions 3 --topic test_topic


# 查看topic具体信息
bin/kafka-topics.sh --bootstrap-server localhost:9092  --describe --topic test_topic


# 查看所有的topic列表
bin/kafka-topics.sh --bootstrap-server localhost:9092 --list


# 删除topic
bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic test_topic


# 修改topic分区数
bin/kafka-topics.sh --bootstrap-server localhost:9092 --alter --partitions 8 --topic test_topic
```

kafka 删除topic有可能提示 `marked for deletion` 这种情况下, 需要停止所有的生产者和消费者
## 消费组操作

```bash
# 显示所有消费组
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --all-groups --list
    

# 查看所有消费组详情
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --all-groups --describe
    

# 查看单独组的详细信息
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group test_group --describe
    

# 手动创建消费组
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic idkNfcKey1 --consumer-property group.id=idpTsp1
    

# 删除消费组（前提是没有在消费的）
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group test_group  --delete
```

## 控制台生产消费

```bash
# 生产者发送消息, 然后控制台输入内容，回车即可
bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test_topic


# 消费者消费消息, --from-beginning  是指从头进行消费，可能会打印大量东西在控制台上。
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test_topic --from-beginning
```


## 清理积压的消息

```bash
# 直接跳过偏移量，将消费组的偏移量设置为最新的偏移量
bin/kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 \
  --group 你的消费组名称 \
  --topic 你的主题名称 \
  --reset-offsets --to-latest \
  --execute

# 重置到 24 小时前的偏移量（格式：PnDTnHnMnS，如 P1D 表示 1 天）
bin/kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 \
  --group 你的消费组名称 \
  --topic 你的主题名称 \
  --reset-offsets --by-duration P1D \
  --execute

# 重置到指定偏移量
bin/kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 \
  --group 你的消费组名称 \
  --topic 你的主题名称:0  # 指定分区（如 0 号分区）
  --reset-offsets --to-offset 10000 \  # 重置到偏移量 10000
  --execute
```


### 控制台查看最新消息

#### 查看一个topic的每个partition的offset
```bash
bin/kafka-run-class.sh kafka.tools.GetOffsetShell --broker-list alikafka-pre-cn-uax3b5ny1002-1-vpc.alikafka.aliyuncs.com:9092,alikafka-pre-cn-uax3b5ny1002-2-vpc.alikafka.aliyuncs.com:9092,alikafka-pre-cn-uax3b5ny1002-3-vpc.alikafka.aliyuncs.com:9092 --topic nova_event_topic --time -1
```

![image.png](https://s3.babudiu.com/iuxt//images/202312051049856.png)

#### 根据每个partition的offset来消费最新消息
```bash
bin/kafka-console-consumer.sh --bootstrap-server alikafka-pre-cn-uax3b5ny1002-1-vpc.alikafka.aliyuncs.com:9092,alikafka-pre-cn-uax3b5ny1002-2-vpc.alikafka.aliyuncs.com:9092,alikafka-pre-cn-uax3b5ny1002-3-vpc.alikafka.aliyuncs.com:9092 --topic nova_event_topic --partition 0 --offset 12080
```

![image.png](https://s3.babudiu.com/iuxt//images/202312051050803.png)
