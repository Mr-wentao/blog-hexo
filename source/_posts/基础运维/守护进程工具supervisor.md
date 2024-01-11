---
title: 守护进程工具supervisor
abbrlink: 4d9192f8
categories:
  - 基础运维
tags:
  - Linux
  - 配置记录
date: 2021-06-01 17:26:04
---

## 安装

```bash
apt-get install supervisor
yum install supervisor
pip install supervisor
```

## 配置文件

```conf
[program:nginx]
directory=/data/exec/nginx/sbin/
command=/data/exec/nginx/sbin/nginx -g "daemon off;"
numprocs=1
autostart=true
autorestart=true
startretries=3
user=root
redirect_stderr=true
stdout_logfile_maxbytes=1024MB
stdout_logfile_backups = 1
stdout_logfile=/data/logs/nginx/nginx-bin.log

environment=JAVA_HOME="xxxxxx",aaa="bbb"
```

> 这个directory用处： 程序路径还是要用绝对路径，但是后面加的参数就可以生效了。

### 启动多个进程

> numprocs=1 大于1个进程的时候：需要加上， 比如程序名test，启动3个进程

```conf
numprocs=3
process_name=%(program_name)s_%(process_num)02d

进程名为:
test:test_00
test:test_01
test:test_02
```

## 常用操作

### 重启daemon进程

```bash
sudo supervisorctl reload
```

### 重启服务

```bash
supervisorctl restart 服务名或all
```

### 重启一组服务

重启test:801-803

```bash
supervisorctl restart test:80{1..3}
```

### 重启所有test开头的服务

```bash
supervisorctl restart test:
```

## 常见问题

用supervisor守护Prometheus发现Prometheus经常报错 max open files ， 但是操作系统已经将open files调整到非常高了。检查下来发现是supervisor主配置文件里面限制了open files数量

vim /etc/supervisord.conf

```ini
[supervisord]
logfile=/var/log/supervisor/supervisord.log  ; (main log file;default $CWD/supervisord.log)
logfile_maxbytes=50MB       ; (max main logfile bytes b4 rotation;default 50MB)
logfile_backups=10          ; (num of main logfile rotation backups;default 10)
loglevel=info               ; (log level;default info; others: debug,warn,trace)
pidfile=/var/run/supervisord.pid ; (supervisord pidfile;default supervisord.pid)
nodaemon=false              ; (start in foreground if true;default false)
minfds=1024                 ; (min. avail startup file descriptors;default 1024)
minprocs=200                ; (min. avail process descriptors;default 200)
;umask=022                  ; (process file creation umask;default 022)
;user=chrism                 ; (default is current user, required if root)
;identifier=supervisor       ; (supervisord identifier, default is 'supervisor')
;directory=/tmp              ; (default is not to cd during start)
;nocleanup=true              ; (don't clean up tempfiles at start;default false)
;childlogdir=/tmp            ; ('AUTO' child log dir, default $TEMP)
;environment=KEY=value       ; (key value pairs to add to environment)
;strip_ansi=false            ; (strip ansi escape codes in logs; def. false)
```

其中`minfds`是限制打开的文件描述符， 将值调大即可， 需要重启supervisord服务。
