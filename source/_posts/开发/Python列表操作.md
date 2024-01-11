---
title: Python列表操作
categories:
  - 开发
tags:
  - 常用操作
  - python
abbrlink: e367d008
cover: 'https://static.zahui.fan/images/202307020714544.svg'
date: 2023-06-27 15:36:51
---



## 列表去除空值

```python
i = [ "a", "", "", "b", "", "c", "" ]
i = [ tmp for tmp in i if tmp ]
print(i)
```
