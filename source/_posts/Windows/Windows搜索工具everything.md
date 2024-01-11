---
title: Windows搜索工具everything
abbrlink: 542f557
categories:
  - Windows
tags:
  - Windows
date: 2021-04-20 14:23:11
---

## 无法弹出移动硬盘?

设置👉🏻️索引👉🏻️NTFS和REFS
取消勾选`自动包含新增固定卷`

## 排除搜索结果

设置👉🏻️索引👉🏻️排除列表👉🏻️添加筛选器

```txt
$RECYCLE.BIN
*AppData\Roaming\Microsoft\Windows\Recent*
*Windows\Prefetch*
*AppData\Local\Packages\Microsoft.Windows.Search_*
```



## 直接修改配置文件


需要将everything进程完全停止后才能进行修改，不然everything关闭的时候会覆盖手动修改的配置文件。
- 退出everything
- 停止everything服务
  ```bat
  net stop everything
  ```


配置文件地址:`%appdata%\Everything\Everything.ini`修改其中一行

```ini
exclude_folders="$RECYCLE.BIN","*AppData\\Roaming\\Microsoft\\Windows\\Recent*","*Windows\\Prefetch*","*AppData\\Local\\Packages\\Microsoft.Windows.Search_*"
```

启动everything服务
```bat
net start everything
```
启动evething软件