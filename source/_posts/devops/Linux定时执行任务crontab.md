---
title: Linux定时执行任务crontab
abbrlink: 2de1df7e
categories:
  - devops
tags:
  - Linux
  - Automatic
  - Crontab
date: 2021-06-01 18:05:02
---

## 常用操作

### 启动停止服务

```bash
systemctl start cron
systemctl stop cron
```

### 查看所有用户crontab

```bash
cat /etc/passwd | cut -f 1 -d : |xargs -I {} crontab -l -u {}
```

## 配置

### 全局配置

crontab在/etc目录下面存在cron.hourly、cron.daily、cron.weekly、cron.monthly、cron.d五个目录, 这些相当于快捷方式, 直接将你的脚本扔进去就可以
和crontab、cron.deny二个文件。

|      目录        |          作用                          |
| ------------ | ---------------------------------- |
| cron.daily   | 每天执行                           |
| cron.weekly  | 每周执行                           |
| cron.monthly | 每月执行                           |
| cron.hourly  | 每小时执行                         |
| crontab      | 系统级任务, 在这里面调用了上面几个 |

### 用户配置文件

直接使用`crontab -e` 编辑就行, `-e`使用的编辑器可以通过`select-editor`来指定
或者使用`crontab -u www-data -e` 指定用户执行。

配置文件在`/var/spool/cron`下

### crontab文件格式

```sh
# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
17 *    * * *    root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *    root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7    root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *    root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
```

### 特殊字符

| 符号 | 含义                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| *    | 代表每的意思，例如month字段如果是星号，则表示每月都执行该命令操作。                                        |
| ,    | 表示分隔时段的意思，例如，“1,3,5,7,9”。                                                                    |
| -    | 表示一个时间范围，例如“2-6”表示“2,3,4,5,6”。                                                               |
| /    | 可以用正斜线指定时间的间隔频率，例如`0-23/2`表示每两小时执行一次。同时正斜线可以和星号一起使用，例如`*/10` |

## 实例

```bash
# 每月每天每小时的第 0 分钟执行一次 /bin/ls
0 * * * * /bin/ls

# 在 12 月内, 每天的早上 6 点到 12 点，每隔 3 个小时 0 分钟执行一次 /usr/bin/backup
0 6-12/3 * 12 * /usr/bin/backup

# 周一到周五每天下午 5:00 寄一封信给 alex@domain.name
0 17 * * 1-5 mail -s "hi" alex@domain.name < /tmp/maildata

# 每月每天的午夜 0 点 20 分, 2 点 20 分, 4 点 20 分....执行 echo "haha"
20 0-23/2 * * * echo "haha"
```

下面再看看几个具体的例子：

```bash
0 */2 * * * /sbin/service httpd restart         # 意思是每两个小时重启一次apache
50 7 * * * /sbin/service sshd start             # 意思是每天7：50开启ssh服务
50 22 * * * /sbin/service sshd stop             # 意思是每天22：50关闭ssh服务
0 0 1,15 * * fsck /home                         # 每月1号和15号检查/home 磁盘
1 * * * * /home/bruce/backup                    # 每小时的第一分执行 /home/bruce/backup这个文件
00 03 * * 1-5 find /home "*.xxx" -mtime +4 -exec rm {} \;   # 每周一至周五3点钟，在目录/home中，查找文件名为*.xxx的文件，并删除4天前的文件。
30 6 */10 * * ls                                            # 意思是每月的1、11、21、31日是的6：30执行一次ls命令
```

注意：当程序在你所指定的时间执行后，系统会寄一封信给你，显示该程序执行的内容，若是你不希望收到这样的信，请在每一行空一格之后加上 `> /dev/null 2>&1` 即可

### 开机自启动

crontab也可实现程序开机自启动的作用，比如一些开机一次性任务等

```cron
@reboot echo "test" >> /tmp/test
```
