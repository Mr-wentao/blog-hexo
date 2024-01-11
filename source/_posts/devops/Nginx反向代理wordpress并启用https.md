---
title: Nginx反向代理wordpress并启用https
abbrlink: 990b6b62
categories:
  - devops
tags:
  - Proxy
  - Nginx
  - Docker
date: 2021-09-03 21:51:03
---

> 反向代理wordpress遇到了问题，nginx不启用https，反向代理没问题（wordpress和nginx之间走http），但是nginx启用了https，页面上的样式就没有了，f12查看，发现js和css走的还是http，所以404

根本原因：wordpress代码里没有开启https，（wordpress认为自己是被http访问的，毕竟nginx是通过http来访问它的）

## 修改wordpress配置

> 感觉这种方案最靠谱，谁的债谁来还。。

在`wp-config.php`的` if ( ! defined( ‘ABSPATH’ ) ) `前面添加：

```php
$_SERVER['HTTPS'] = 'on';
define('FORCE_SSL_LOGIN', true);
define('FORCE_SSL_ADMIN', true);
```

### 如果是官方Docker容器的话

强烈建议Nginx的location /里面添加一个头：

```conf
proxy_set_header X-Forwarded-Proto $scheme;
```

wordpress官方Docker镜像会检测这个头来判断是否代码里开启https

原因是在：
wp-config.php里面， 为了开启下面的参数

```php
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}
```

参考：
<https://github.com/docker-library/wordpress/pull/142>

<https://hub.docker.com/_/wordpress>
