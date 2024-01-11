---
title: Linux时间处理与格式化
categories:
  - 基础运维
tags:
  - time
  - 时间
abbrlink: 871fdda4
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
date: 2022-11-07 12:51:06
---

## 把unix时间戳转换为人类可读的时间

```bash
date -d @1660396123 +"%Y-%m-%d %H:%M:%S"
```

## 时间转换为unix时间戳

```bash
date -d 'Sat May 15 23:00:27 CST 2021' +%s
```

## 获取之前的时间

```bash
date -d 'yesterday' +'%Y-%m-%d %H:%M:%S'
date -d '-2 hours' +'%Y-%m-%d %H:%M:%S'

date -d "2 days ago" +%Y.%m.%d
date -d "1 week ago" +%Y.%m.%d
date -d "1 year ago" +%Y.%m.%d
date -d "1 month ago" +%Y.%m.%d
date -d "-7 days" +%Y%m%d
```

## 指定格式输出

```bash
date +'%Y-%m-%d %H:%M:%S'
# 2023-11-21 13:36:51
```

| 格式 | 说明 |
| ---- | ---- |
| %Y   | 年   |
| %m   | 月   |
| %d   | 日   |
| %H   | 时   |
| %M   | 分   |
| %S   | 秒   |
