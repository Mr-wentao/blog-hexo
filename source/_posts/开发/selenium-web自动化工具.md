---
title: selenium--web自动化工具
abbrlink: 7a4b3586
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - 开发
tags:
  - Python
  - Automatic
date: 2021-02-21 21:30:56
---

> selenium是一个web自动化工具，它可以控制chrome浏览器实现我们想要的功能，跟爬虫不同的是：它是模拟人类的操作。

## 安装

### 下载对应版本的chromedriver

<http://npm.taobao.org/mirrors/chromedriver>放到环境变量里

### 安装python包

```bash
pip install selenium -i https://pypi.tuna.tsinghua.edu.cn/simple
```

## 编写脚本

### 获取xpath

获取xpath可以按下`ctrl + shift + c`点击按钮， 高亮的地方右键复制 full xpath

![获取XPATH属性](https://static.zahui.fan/images/202211251607799.png)

### 获取id

Charome浏览器界面按下`ctrl + shift + c` 点击页面, 右边属性记录一下html的id属性

![获取id属性](https://static.zahui.fan/images/202211251604573.png)

### 代码

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-
import time
from selenium import webdriver

# 模拟浏览器打开到gitee登录界面
driver = webdriver.Chrome()
driver.get('https://gitee.com/login')

# 将窗口最大化
driver.maximize_window()

# 通过html的id属性定位输入位置, 然后输入文本
driver.find_element(By.ID, r'user_login').send_keys("这里写你的用户名")

# 通过xpath查找位置, 然后点击鼠标
driver.find_element(By.XPATH, r'/html/body/div[2]/div[1]/div[2]/div/div/div[1]/div[2]/div/div/div[2]/div/div/div/form/div[5]/button').click()

# 退出浏览器
driver.quit()
```

## 常用操作

### 不显示浏览器界面

```python
from selenium import webdriver
from selenium.webdriver import ChromeOptions
from selenium.webdriver.chrome.options import Options

# 隐藏浏览器界面
chrome_option = Options()
chrome_option.add_argument('--headless')
chrome_option.add_argument('--disable-gpu')

# 防止检测, 同时浏览器不会有受到自动化测试软件控制的提示
option = ChromeOptions()
option.add_experimental_option('excludeSwitches', ['enable-automation'])

driver = webdriver.Chrome(chrome_options=chrome_option, options=option)
driver.get('https://signin.aliyun.com/login.htm#/main')
```

### 截图

```python
driver.get_screenshot_as_file("test.png")
```

### 使用代理

```python
from selenium import webdriver
from selenium.webdriver import ChromeOptions

options = webdriver.ChromeOptions()

# 配置代理地址
options.add_argument('--proxy-server=http://localhost:80')

# 不提示证书错误
options.add_argument("--ignore-certificate-errors")

# 让浏览器不会自动退出
options.add_experimental_option("detach", True)

driver = webdriver.Chrome(options=options)
```
