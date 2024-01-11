---
title: Python使用dotenv来管理环境变量
abbrlink: 026f1c74
categories:
  - 开发
tags:
  - Python
  - 配置文件
  - Script
  - Shell
date: 2021-12-07 17:47:08
---

> 管理环境变量是一件比较麻烦的事情，好在python有python-dotenv可以帮助我们来简化这个操作

## 安装

直接pip来安装就好

```bash
pip install python-dotenv
```

## 使用

创建.env文件，记得添加到.gitignore里面

.env文件内容为键值对形式

```env
#这是注释
FOO="BAR"
```

```python
import dotenv
import os

dotenv.load_dotenv()

print(os.getenv("FOO"))
```

## shell脚本怎么使用.env文件

```bash
source .env

echo $FOO
```
