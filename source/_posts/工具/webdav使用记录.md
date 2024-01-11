---
title: webdav使用记录
categories:
  - 工具
tags:
  - webdav
  - curl
  - 命令行工具
  - cli
abbrlink: 1e91b84d
date: 2023-07-04 07:23:12
---


## 在windows挂载到z盘

```bat
:: 映射坚果云webdav, PERSISTENT:no表示不会记忆映射, 重启会丢失.
net use Z: https://dav.jianguoyun.com/dav/ /user:iuxt@qq.com <密码> /PERSISTENT:no
```

## 通过curl使用webdav

### 上传文件

```bash
# 本地的test-new.zip文件上传到远程为test.zip
curl --user x@zahui.fan:<密码> https://file.babudiu.com/dav/test.zip -T ./test-new.zip 

# 保留文件名不变
curl --user x@zahui.fan:<密码> https://file.babudiu.com/dav/ -T ./test-new.zip 
```

### 创建目录

```bash
# 创建根目录 xxxxxxx
curl --user x@zahui.fan:<密码> -X MKCOL https://file.babudiu.com/dav/xxxxxxx/
```

### 重命名文件

```bash
# 将远程的目录名 1 改为 2
curl --user x@zahui.fan:<密码> -X MOVE --header 'Destination:https://file.babudiu.com/dav/2/' https://file.babudiu.com/dav/1/
```

### 删除文件

```bash
curl --user x@zahui.fan:<密码> -X DELETE https://file.babudiu.com/dav/2/
```