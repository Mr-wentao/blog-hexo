---
title: mac下实现快速登陆带有两步验证的ssh跳板机
categories:
  - 工具
tags:
  - mac
  - python
  - pyotp
  - 效率工具
abbrlink: ee380870
cover: 'https://static.zahui.fan/images/202308242224563.png'
date: 2023-08-24 18:19:01
---

我们有个堡垒机当前的登陆流程是： ssh username@ip -p port --> 输入密码 --> 打开手机 --> 查看两部验证码 --> 输入 --> 连接成功

## 解决输入密码的问题

mac因为安全问题使用brew已经无法安装sshpass这个包了， 我们可以使用ssh key来进行免密登陆并提高安全性。不同的跳板机平台设置方式不太一样，基本都是在个人信息设置里面增加。

![](https://static.zahui.fan/images/202308241841436.png)

## 解决输入两步验证码的问题

![](https://static.zahui.fan/images/202308241827374.png)

两步验证码就是TOTP，基于生成的6位数字， 30s更换一次， 我们需要先拿到TOTP的seed， 一般都会给一个二维码，用二维码解析工具解析， 解析出来的内容大致类似于：

```
otpauth://totp/Microsoft:iuxt@outlook.com?secret=XUHHW5TKKTYGMJYM&issuer=Microsoft
```

secret= 后面的内容就是TOTP的seed

### 使用脚本来生成两步验证码

可以使用python的pyotp包

```python
import pyotp
import sys
totp = pyotp.TOTP(sys.argv[1])
totp_password = totp.now()
print(totp_password)
```

### 写入剪切板

```bash
python3 ~/code/tools/totp.py XUHHW5TKKTYGMJYM | pbcopy
```

然后登陆的时候直接粘贴就可以了。

## 最终效果

~/.zshrc 里面的内容：

```bash
alias gac_pub='python3 ~/code/tools/totp.py XUHHW5TKKTYGMJYM | pbcopy && ssh xxx@x.x.x.x -p 60022'
```

需要连接跳板机的时候， 直接执行gac_pub， 然后粘贴即可。 虽然没有完全自动化， 但是也不用低头打开手机查看验证码了。

iterm2 带有action， 可以根据屏幕显示来执行命令， 理论上可以自动填充TOTP，暂时没有时间测试。