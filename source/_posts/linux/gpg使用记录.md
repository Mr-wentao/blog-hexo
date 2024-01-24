---
title: gpg使用记录
categories:
  - devops
tags:
  - gpg
  - 加密
abbrlink: e0fe652d
cover: 'https://static.zahui.fan/images/202212261651813.svg'
date: 2022-12-26 08:48:05
---

要了解什么是GPG，就要先了解PGP。

1991年，程序员Phil Zimmermann为了避开政府监视，开发了加密软件PGP。这个软件非常好用，迅速流传开来，成了许多程序员的必备工具。但是，它是商业软件，不能自由使用。所以，自由软件基金会决定，开发一个PGP的替代品，取名为GnuPG。这就是GPG的由来。

GPG有许多用途，本文主要介绍文件加密。至于邮件的加密，不同的邮件客户端有不同的设置。

当前我的系统环境是`Ubuntu 22.04` gpg版本是`gpg (GnuPG) 2.2.27`。

## 创建密钥对

```bash
# 快速生成密钥对
gpg --gen-key

# 交互式创建
gpg --full-gen-key
```

这里我们使用 --full-gen-key 来生成密钥对，首先选择密钥类型，选择 1 (默认) 即可

```bash
$ gpg --full-gen-key

gpg (GnuPG) 2.2.27; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
  (14) Existing key from card
Your selection?
```

然后选择密钥长度，没有特殊需求的话保持 3072 的默认选项即可

```bash
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072)
```

然后设置密钥的有效期，因为我们需要长期使用，所以选择 0 ，密钥永不过期, 也可以输入2y， 表示2年。

```bash
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0)
```

确定后，依次输入姓名、电子邮件和注释 (可以不填)，然后选择 o 确定, 确定后会出现一个窗口让输入密码，自行设置一个密码。然后密钥就创建成功了， 通过命令`gpg --list-keys`可以查看当前的密钥

这里有一串字符。就是key的id，后面的操作都需要这个。

![查看key](https://static.zahui.fan/images/202212271033949.png)

## 创建子密钥

上面创建的是公钥，如果使用这个密钥加密， 那么如果密钥不小心泄露， 就必须吊销整个密钥。所以我们创建子密钥来使用。

```bash
gpg --edit-key 4208C2FA114EE038F9EAD2374808D00D9D910E74
```

进入gpg控制台， 输入 `addkey`

输入一些选择， 过期时间建议2y，然后输入密钥的密码后，在控制台输入save保存退出。

## 导出密钥

导出密钥默认是二进制存储，如果需要纯文本，加上 `--armor` 参数

### 导出主密钥

```bash
gpg -o /data/gpg_key --export-secret-keys 4208C2FA114EE038F9EAD2374808D00D9D910E74
```

主密钥一定要保存好，不要泄露

### 导出子密钥

```bash
gpg -o /data/gpg_key.sub --export-secret-subkeys 4208C2FA114EE038F9EAD2374808D00D9D910E74
```

### 导出公钥

> 公钥是需要公开的，可以将公钥发送给别人，别人用于加密

```bash
gpg --armor --output /data/public-key.txt --export 4208C2FA114EE038F9EAD2374808D00D9D910E74
```

#### 上传公钥

> 也可以将公钥上传到公共服务器上

```bash
gpg --send-keys 4208C2FA114EE038F9EAD2374808D00D9D910E74
```

### 导出吊销证书

```bash
gpg --generate-revocation 4208C2FA114EE038F9EAD2374808D00D9D910E74
```

不过实际上在生成密匙时就已经生成了一份吊销证书了，放在这个目录下面 `~/.gnupg/openpgp-revocs.d/`

```bash
mv ~/.gnupg/openpgp-revocs.d/4208C2FA114EE038F9EAD2374808D00D9D910E74.rev /data/
```

## 卸载密钥

```bash
gpg --delete-secret-keys 4208C2FA114EE038F9EAD2374808D00D9D910E74
```

## 使用密钥

### 导入密钥

在{%label 自己的 red %}电脑上面

```bash
gpg --import /data/gpg_key.sub
```

### 加密

```bash
gpg --recipient 4208C2FA114EE038F9EAD2374808D00D9D910E74 --output test_en.txt --encrypt test.txt
```

### 解密

```bash
gpg test_en.txt
```

### 签名

有时，我们不需要加密文件，只需要对文件签名，表示这个文件确实是我本人发出的。sign参数用来签名。

```bash
gpg --sign test.txt
```

然后生成了一个test.txt.gpg文件，我们打开这个文件后，发现这也是一个二进制的数据，这并不是加密后的数据，与上边的二进制数据不一样。如果想生成ASCII码的签名文件，可以使用clearsign参数

```bash
gpg --clearsign test.txt
```

如果想生成单独的签名文件，与文件内容分开存放，可以使用detach-sign参数。

```bash
gpg --detach-sign test.txt
```

是一个二进制的数据，如果想采用ASCII码形式，要加上armor参数

```bash
gpg --armor --detach-sign test.txt
```

### 签名+加密

```bash
gpg --local-user [发信者ID] --recipient [接收者ID] --armor --sign --encrypt test.txt
```

local-user参数指定用发信者的私钥签名，recipient参数指定用接收者的公钥加密，armor参数表示采用ASCII码形式显示，sign参数表示需要签名，encrypt参数表示指定源文件。

### 验证签名

我们收到别人签名后的文件，需要用对方的公钥验证签名是否为真。verify参数用来验证

```bash
gpg --verify test.txt.asc test.txt
```

## 配合GitHub使用

首先，需要让Git知道签名所用的GPG密钥ID

```bash
git config --global user.signingkey {key_id}
```

然后，在每次commit的时候，加上-S参数，表示这次提交需要用GPG密钥进行签名：

```bash
git commit -S -m "..."
```

如果觉得每次都需要手动加上-S有些麻烦，可以设置Git为每次commit自动要求签名：

```bash
git config --global commit.gpgsign true
```

然后添加变量到`.bashrc`

```bash
export GPG_TTY=$(tty)
```

commit时皆会弹出对话框，需要输入该密钥的密码，以确保是密钥拥有者本人操作
