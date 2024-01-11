---
title: python处理字符串
categories:
  - 开发
tags:
  - python
  - 字符串
abbrlink: 5d196648
cover: 'https://static.zahui.fan/images/202307020714544.svg'
date: 2023-06-30 19:50:38
---

## 读取多行字符串

使用字符串的splitlines方法

```python
data = '''1 2 3
4 5 6
7 8 9'''

# data.splitlines()  -->  ['1 2 3', '4 5 6', '7 8 9']
for line in data.splitlines():
    i = [i for i in line.split(' ') if i] # 去除列表中的空值
    print(i)
```

## 字符串格式化

使用 `%` 这种格式化方式即将被废弃, 可以使用 `{}` 这种占位符, 更直观

### 使用位置替换

```python
>>> '{0}, {1}, {2}'.format('a', 'b', 'c')
'a, b, c'
>>> '{}, {}, {}'.format('a', 'b', 'c')  # 3.1+ only
'a, b, c'
>>> '{2}, {1}, {0}'.format('a', 'b', 'c')
'c, b, a'
>>> '{2}, {1}, {0}'.format(*'abc')      # unpacking argument sequence
'c, b, a'
>>> '{0}{1}{0}'.format('abra', 'cad')   # arguments' indices can be repeated
'abracadabra'
```

### 按名称替换参数

```python
>>> 'Coordinates: {latitude}, {longitude}'.format(latitude='37.24N', longitude='-115.81W')
'Coordinates: 37.24N, -115.81W'
>>> coord = {'latitude': '37.24N', 'longitude': '-115.81W'}
>>> 'Coordinates: {latitude}, {longitude}'.format(**coord)
'Coordinates: 37.24N, -115.81W'
```
