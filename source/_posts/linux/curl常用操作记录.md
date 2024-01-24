---
title: curl常用操作记录
categories:
  - devops
tags:
  - curl
  - 配置记录
  - 常用操作
abbrlink: lqyxid2z
cover: 'https://static.zahui.fan/images/202401042235455.png'
date: 2024-01-04 16:12:00
---

curl 是常用的命令行工具，用来请求 Web 服务器。它的名字就是客户端（client）的 URL 工具的意思。

它的功能非常强大，命令行参数多达几十种。如果熟练的话，完全可以取代 Postman 这一类的图形界面工具。

参考文章: <https://www.ruanyifeng.com/blog/2019/09/curl-reference.html>


## 参数
### -A

-A参数指定客户端的用户代理标头，即`User-Agent`。curl 的默认用户代理字符串是`curl/[version]`。

```bash
# 将User-Agent改成 Chrome 浏览器
curl -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36' https://google.com

# 移除User-Agent
curl -A '' https://google.com
```


也可以通过-H(更改Header)参数直接指定User-Agent

```bash
curl -H 'User-Agent: php/1.0' https://google.com
```

### -b
-b参数用来向服务器发送 Cookie。

```bash
# 发送cookie
curl -b 'foo=bar' https://google.com
curl -b 'foo1=bar;foo2=bar2' https://google.com

# 读取本地文件cookies.txt，里面是服务器设置的 Cookie（参见-c参数），将其发送到服务器。
curl -b cookies.txt https://www.google.com
```

### -c
-c参数将服务器设置的 Cookie 写入一个文件。

```bash
# 将服务器的 HTTP 回应所设置 Cookie 写入文本文件cookies.txt。
curl -c cookies.txt https://www.google.com
```

### -d
-d参数用于发送 POST 请求的数据体。

```bash
# 使用-d参数以后，HTTP 请求会自动加上标头Content-Type : application/x-www-form-urlencoded。并且会自动将请求转为 POST 方法，因此可以省略-X POST。
curl -d 'login=emma＆password=123' -X POST https://google.com/login
curl -d 'login=emma' -d 'password=123' -X POST https://google.com/login


# -d参数可以读取本地文本文件的数据，向服务器发送。
curl -d '@data.txt' https://google.com/login
```


### -e
-e参数用来设置 HTTP 的标头Referer，表示请求的来源。

```bash
# 将Referer标头设为https://google.com?q=example
curl -e 'https://google.com?q=example' https://www.example.com


# -H参数可以通过直接添加标头Referer，达到同样效果。
curl -H 'Referer: https://google.com?q=example' https://www.example.com
```

### -F和-T
-F参数用来上传多个文件
-T参数用于上传单个文件
```bash
# 给 HTTP 请求加上标头Content-Type: multipart/form-data，然后将文件photo.png作为file字段上传
curl -F 'file=@photo.png' https://google.com/profile


# 指定 MIME 类型为image/png，否则 curl 会把 MIME 类型设为application/octet-stream
curl -F 'file=@photo.png;type=image/png' https://google.com/profile


# 指定文件名, 原始文件名为photo.png，但是服务器接收到的文件名为me.png
curl -F 'file=@photo.png;filename=me.png' https://google.com/profile

# 上传单个文件
curl -T /path/to/file.txt http://example.com/upload
```

### -H
-H参数添加 HTTP 请求的标头。
```bash
curl -H 'Accept-Language: en-US' https://google.com
curl -H 'Accept-Language: en-US' -H 'Secret-Message: xyzzy' https://google.com


# 添加 HTTP 请求的标头是Content-Type: application/json，然后用-d参数发送 JSON 数据。
curl -d '{"login": "emma", "pass": "123"}' -H 'Content-Type: application/json' https://google.com/login
```


### -i
-i参数打印出服务器回应的 HTTP 标头。

```bash
# 收到服务器回应后，先输出服务器回应的标头，然后空一行，再输出网页的源码
curl -i https://www.example.com
```

### -I(--head)
-I参数向服务器发出 HEAD 请求，然会将服务器返回的 HTTP 标头打印出来。

```bash
curl -I https://www.example.com
```

### -k

```bash
# 跳过 SSL 检测
curl -k https://www.example.com
```

### -L
-L参数会让 HTTP 请求跟随服务器的重定向。curl 默认不跟随重定向。

```bash
curl -L -d 'tweet=hi' https://api.twitter.com/tweet
```
### --limit-rate
--limit-rate用来限制 HTTP 请求和回应的带宽，模拟慢网速的环境。

```bash
# 将带宽限制在每秒 200K 字节
curl --limit-rate 200k https://google.com
```

### -o
-o参数将服务器的回应保存成文件，等同于wget命令。

```bash
# 需要指定保存的文件名
curl -o example.html https://www.example.com
```

### -O
-O参数将服务器回应保存成文件，并将 URL 的最后部分当作文件名。

```bash
# 将服务器回应保存成文件，文件名为bar.html
curl -O https://www.example.com/foo/bar.html
```

### -s
-s参数将不输出错误和进度信息。

```bash
# 一旦发生错误，不会显示错误信息。不发生错误的话，会正常显示运行结果。
curl -s https://www.example.com

# 如果想让 curl 不产生任何输出，可以使用下面的命令。
curl -s -o /dev/null https://google.com
```

### -u
-u参数用来设置服务器认证的用户名和密码。

```bash
# 设置用户名为bob，密码为12345，然后将其转为 HTTP 标头Authorization: Basic Ym9iOjEyMzQ1
curl -u 'bob:12345' https://google.com/login

# 识别 URL 里面的用户名和密码，将其转为上个例子里面的 HTTP 标头
curl https://bob:12345@google.com/login

# 设置了用户名，执行后，curl 会提示用户输入密码
curl -u 'bob' https://google.com/login
```

### -v
-v参数输出通信的整个过程，用于调试。

```bash
curl -v https://www.example.com
curl --trace - https://www.example.com
```

### -x
-x参数指定 HTTP 请求的代理。

```bash
# 请求的代理默认使用 HTTP 协议
curl -x socks5://james:cats@myproxy.com:8080 https://www.example.com
curl -x james:cats@myproxy.com:8080 https://www.example.com
```

### -X
-X参数指定 HTTP 请求的方法。

```bash
curl -X POST https://www.example.com
```
