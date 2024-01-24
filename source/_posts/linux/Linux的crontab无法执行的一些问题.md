---
title: Linux的crontab无法执行的一些问题
abbrlink: 63d10d9c
categories:
  - devops
tags:
  - Crontab
  - Linux
date: 2022-01-06 16:50:41
---

crontab是linux平台的定时任务系统，不过有时候可以运行的命令或脚本在crontab里面就是不运行，下面找了一些可能的原因以及解决方案。

## 看不到日志

一般来说，crontab的任务控制台输出会打到`/var/spool/mail/<username>`里面，然后通过email发出去  
`crontab`服务的运行的日志一般都在`/var/log/cron`里面，这个日志可以看到任务有没有执行  

如果想将命令输出内容重定向到其他文件，可以在命令后添加`2>&1`, 不加`2>&1`错误日志看不到

```bash
* * * * * date >> /tmp/cron.log 2>&1
```

## 环境变量的问题

crontab环境变量和登录shell查看的环境变量是不同的，比如

```bash
* * * * * env >> /tmp/env.log 2>&1
```

查看一下：

```ini
HOME=/home/iuxt
LOGNAME=iuxt
PATH=/usr/bin:/bin
LANG=C.UTF-8
SHELL=/bin/sh
PWD=/home/iuxt
```

比系统的环境变量要少很多，比如PATH只有`/usr/bin`和`/bin`， 安装在其他位置的程序是会`command not found`的，解决方法有两个：

1. 写绝对路径

    ```bash
    * * * * * /usr/bin/env >> /tmp/env.log 2>&1
    ```

    > 但是这个方法对于很多脚本比较麻烦，因为脚本里面可能用的是相对路径也会`command not found`的

2. crontab的首部添加需要的环境变量

    ```bash
    PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    SHELL=/bin/bash
    LANG=en_US.UTF-8
    * * * * * env >> /tmp/env.log 2>&1
    ```

    > note: flask程序需要运行在`en_US.UTF-8`locale下

3. 在命令的前方添加环境变量

    ```crontab
    * * * * * TEST=XXX env >> /tmp/env.log 2>&1
    ```

4. 把命令放进shell脚本里，在脚本顶部声明环境变量

    ```bash
    #!/bin/bash
    PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    ```

## 权限问题

这个比较好理解了，crontab也是分用户执行的  
cron配置文件在`/var/spool/cron/用户名`(redhat系)，没有权限访问可执行文件，或者没有权限生成临时文件等都会导致crontab执行失败。

使用crontab编辑的时候可以指定用户

```bash
crontab -u iuxt -e
```

## 换行符

这个比较坑了，man crontab解释如下：

```text
Although cron requires that each entry in a crontab end in a newline character, neither the crontab command nor the cron daemon will detect this error. Instead, the crontab will appear to load normally. However, the command will never run. The best choice is to ensure that your crontab has a blank line at the end.

4th Berkeley Distribution 29 December 1993 CRONTAB(1)
```

每一条cron表达式都要以换行符结尾，保险起见crontab最后留一个空行吧。

## 服务没启动

crontab服务crond没有启动

启动`servicd crond start`

## 时区问题

修改时区后需要重启crond服务才能以新的时区为准。
