---
title: Nginx设置图片防盗链
abbrlink: 9e870c50
categories:
  - devops
tags:
  - Nginx
  - 配置记录
date: 2022-05-26 00:27:14
---

常见的使用Nginx进行防盗链配置是利用了referer, 也就是来源地址来判断, 只要不是白名单中的地址, 就禁止访问, referer是比较有效的方式, 但是可以轻松绕过, 目的是为了防止页面被别人复制粘贴我们的文章, 图片等资源依然使用我们的连接, 占用带宽或流量造成费用.

## 白名单模式

这种模式就是在白名单之外的所有域名都不能请求我们的图片等资源

配置示例:

```conf
# 资源防盗链（指定目录or指定文件类型）
  location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$ {
  # location /upload/ {
    access_log off;

    # none：表示没有 referer 的可以访问
    # blocked：表示 referer 没有值的可以访问
    # server_names：表示 Nginx 的 server_name 可以访问
    # ~.*google\.：google 前后都是正则匹配, ~表示后面的是正则匹配

    valid_referers none blocked server_names
      127.0.0.1
      ~.*google\.
      ~.*baidu\.
      ~.*bing\.
      ~.*sogou\.
      ~.*360\.
      ~.*zahui.fan;
    if ($invalid_referer) {
      # 这里也可以 return 一个403 等
      rewrite ^/ https://static.zahui.fan/images/babudiu_block.jpg;
    }
    proxy_pass http://halo;
  }

}
```

## 黑名单模式

未完待续...
