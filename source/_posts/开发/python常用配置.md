---
title: python常用配置
categories:
  - 开发
tags:
  - 配置记录
  - Python
abbrlink: b19de2c2
cover: 'https://static.zahui.fan/images/202307020714544.svg'
date: 2023-05-04 16:44:14
---

## pip

### 升级pip版本

```bash
pip install -i https://mirrors.ustc.edu.cn/pypi/web/simple pip -U
```

## 镜像源

中科大源配置说明： <https://mirrors.ustc.edu.cn/help/pypi.html>

### 临时使用

```bash
pip install -i https://mirrors.ustc.edu.cn/pypi/web/simple package
```

### 设为默认

{% tabs TabName %}

<!-- tab 通过pip命令来配置 -->
升级 pip 到最新的版本 (>=10.0.0) 后进行配置：

```bash
pip config set global.index-url https://mirrors.ustc.edu.cn/pypi/web/simple
```

<!-- endtab -->

<!-- tab 通过配置文件来配置 -->
vim ~/.config/pip/pip.conf

```ini
[global]
index-url = https://mirrors.ustc.edu.cn/pypi/web/simple
```

<!-- endtab -->

{% endtabs %}
