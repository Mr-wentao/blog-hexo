---
title: 使用acme.sh来自动更新https证书
abbrlink: 1e777b9e
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - SSL
date: 2022-04-28 08:29:04
---

使用acme.sh可以自动申请let's encrypt证书，并且可以自动配置到nginx，整个过程可以全自动。
也可以使用certbot，certbot基于acme.sh[使用certbot自动申请ssl证书](/posts/28c679c3)

## 安装

推荐安装socat

```bash
sudo apt install socat
```

安装acme.sh

```bash
curl  https://get.acme.sh | sh
```

退出终端，重新登陆后，执行acme.sh有输出，说明安装成功了。

## 配置邮箱

```bash
acme.sh --register-account -m "iuxt@qq.com"
```

## 配置默认CA

新版默认zerossl，也可以手动切换为let's encrypt
```bash
# acme.sh --set-default-ca --server letsencrypt
# acme.sh --set-default-ca --server zerossl
```

## 申请证书

acme.sh 实现了 acme 协议支持的所有验证协议.
一般有两种方式验证: http 和 dns 验证.

### 使用dns api自动申请

官方说明: <https://github.com/acmesh-official/acme.sh/wiki/dnsapi>

#### DNSpod
这里以dnspod为例，申请一个dnspod的api key
![申请dnspod api](https://static.zahui.fan/images/20220428083952.png)

将id和key记录下来，执行

```bash
export DP_Id="310134"
export DP_Key="你的api key"

acme.sh --issue --dns dns_dp -d babudiu.com -d www.babudiu.com
```

执行一次就会把id和key记录在`~/.acme.sh/account.conf`，下次再执行就不用再提供id和key了

```bash
# 遇到问题可以查看debug日志
acme.sh --issue --dns dns_dp -d jenkins.babudiu.com --debug

# 申请泛域名证书, 泛域名不包括一级域名, 所以也要把一级域名加上
acme.sh --issue --dns dns_dp -d babudiu.com -d *.babudiu.com
```

如果找不到acme.sh， 可以使用绝对路径`~/.acme.sh/acme.sh`

#### cloudflare dns

获取API令牌
![image.png](https://static.zahui.fan/images/202312091611899.png)


```bash
export CF_Key="你的api key"
export CF_Email="iuxt@qq.com"
acme.sh --issue --dns dns_cf --dnssleep 600 -d babudiu.com -d *.babudiu.com
```


### 使用HTTP认证

http 方式需要在你的网站根目录下放置一个文件, 来验证你的域名所有权, 完成验证. 然后就可以生成证书了.

```bash
acme.sh --issue -d mydomain.com -d www.mydomain.com --webroot /home/wwwroot/mydomain.com/
```

只需要指定域名, 并指定域名所在的网站根目录. acme.sh 会全自动的生成验证文件, 并放到网站的根目录, 然后自动完成验证. 最后会聪明的删除验证文件. 整个过程没有任何副作用.

如果你用的 apache 服务器, acme.sh 还可以智能的从 apache 的配置中自动完成验证, 你不需要指定网站根目录:

```bash
acme.sh --issue -d mydomain.com --apache
```

如果你用的 nginx 服务器, 或者反代, acme.sh 还可以智能的从 nginx 的配置中自动完成验证, 你不需要指定网站根目录:

```bash
acme.sh --issue -d mydomain.com --nginx
```

注意, 无论是 apache 还是 nginx 模式, acme.sh 在完成验证之后, 会恢复到之前的状态, 都不会私自更改你本身的配置.

如果你还没有运行任何 web 服务, 80 端口是空闲的, 那么 acme.sh 还能假装自己是一个 webserver, 临时听在 80 端口, 完成验证:

```bash
acme.sh --issue -d mydomain.com --standalone
```

更高级的用法请参考: <https://github.com/Neilpang/acme.sh/wiki/How-to-issue-a-cert>

## 安装证书

默认生成的证书都放在`~/.acme.sh/`, 可以使用`--install-cert`命令, 将证书复制到指定的位置。

只有通过这种方式来复制证书，以后才能自动更新，手动复制的证书不能自动更新。

{% tabs TabName %}

<!-- tab Apache -->

```bash
export DOMAIN=babudiu.com
acme.sh --install-cert -d "${DOMAIN}" \
    --cert-file      /path/to/certfile/in/apache/"${DOMAIN}".crt  \
    --key-file       /path/to/keyfile/in/apache/"${DOMAIN}".key  \
    --fullchain-file /path/to/fullchain/certfile/apache/"${DOMAIN}"-fullchain.pem \
    --reloadcmd     "systemctl reload httpd"
```

<!-- endtab -->

<!-- tab Nginx -->

```bash
export DOMAIN=babudiu.com
acme.sh --install-cert -d "${DOMAIN}" \
    --key-file       /etc/nginx/ssl/"${DOMAIN}".key  \
    --fullchain-file /etc/nginx/ssl/"${DOMAIN}".crt \
    --reloadcmd     "nginx -s reload"
```

<!-- endtab -->
{% endtabs %}

## 升级acme.sh

手动升级

```bash
acme.sh --upgrade
```

也可以设置自动升级

```bash
acme.sh  --upgrade  --auto-upgrade
```

关闭自动更新

```bash
acme.sh --upgrade  --auto-upgrade  0
```

Nginx 证书配置的解释

| 文件名                 | 内容                                                         |
| ---------------------- | ------------------------------------------------------------ |
| cert.pem               | 服务端证书                                                   |
| chain.pem              | 浏览器需要的所有证书但不包括服务端证书，比如根证书和中间证书 |
| fullchain.pem          | 包括了 cert.pem 和 chain.pem 的内容                          |
| privkey.pem            | 证书的私钥                                                   |

## 错误排查

添加`--debug`参数，看看输出结果，都会很详细的说明问题原因。
