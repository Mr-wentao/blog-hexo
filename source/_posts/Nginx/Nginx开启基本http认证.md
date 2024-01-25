---
title: Nginx开启基本http认证
abbrlink: 5855bc56
categories:
  - Nginx
tags:
  - Nginx
  - Auth
date: 2021-05-28 15:25:48
---

> Nginx 使用  `ngx_http_auth_basic_module`  模块支持 HTTP基本身份验证功能

## nginx配置

比如需要/api路径下的资源需要认证

```conf
location ^~ /api {
    auth_basic "authentication";
    auth_basic_user_file conf.d/.htpasswd;
}
```

## 配置密码文件.htpasswd

两种方法二选一

### 使用htpasswd生成

```bash
# Ubuntu or Debian
apt install apache2-utils

# Rhel or CentOS:
yum install httpd-tools
```

生成密码, 密码文件为`.htpasswd`

```bash
htpasswd -bcd .htpasswd username password
```

### 使用openssl生成

> `echo -n xxx`不打印换行符

```bash
echo  -n 'username:' >> .htpasswd
openssl passwd -1 password >> .htpasswd
# -1 参数可以换成 -2 -3 ... -6, 数字越大,密码越长(md5算法). 还可以 -apr1 (Apache variant of the BSD algorithm).
```

> openssl 生成的密码也可以用到linux的/etc/shadow里面
