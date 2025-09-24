---
title: Django配置MySQL数据库支持
categories:
  - 开发
tags:
  - django
  - mysql
abbrlink: 28913a98
cover: 'https://s3.babudiu.com/iuxt//public/django.svg'
date: 2022-11-21 17:54:17
---

Django支持MySQL主要有两种方式, 一种是使用`pymysql`包, 这个是个纯python包, 可以跨平台运行, 不过性能较差, 另一种是`mysqlclient`, 这个需要操作系统支持, 在linux平台可以获得更好的性能, 在windows系统下安装比较麻烦。

## mysqlclient

mysqlclient 需要依赖操作系统的库

{% tabs TabName %}

<!-- tab Ubuntu和Debian安装 -->
```bash
sudo apt install python3-dev default-libmysqlclient-dev build-essential
```
<!-- endtab -->

<!-- tab CentOS和Fedora安装 -->
```bash
sudo yum install python3-devel mysql-devel
```
<!-- endtab -->

{% endtabs %}

然后pip安装mysqlclient

```bash
pip install mysqlclient
```

## pymysql

直接安装:

```bash
pip install pymysql
```

在 `__init__.py` 或者 `settings.py` 文件开头添加

```python
import pymysql
pymysql.install_as_MySQLdb()
```


## settings.py配置

Django的settings.py需要配置：

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'django',
        'USER': 'root',
        'PASSWORD': '123456',
        'HOST': '127.0.0.1',
        'PORT': '3306'
    }
}
```
