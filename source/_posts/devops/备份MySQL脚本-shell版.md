---
title: 备份MySQL脚本-shell版
categories:
  - devops
tags:
  - 备份还原
  - MySQL
  - 脚本
  - Shell
abbrlink: lqevsmdb
date: 2022-12-21 15:28:36
---

备份数据库, 并排除系统库, 使用mysqldump

```bash
#!/bin/bash
set -euo pipefail

mysql_host=192.168.13.187
mysql_user=root
mysql_passwd=cert@test.2019
exclude_databases=information_schema|performance_schema|sys|mysql

echo "开始备份数据库……"
mysql -h"${mysql_host}" -u"${mysql_user}" -p"${mysql_passwd}" -N -e "show databases;" | grep -Ev "${exclude_databases}" | xargs mysqldump -h"${mysql_host}" -u"${mysql_user}" -p"${mysql_passwd}" --databases > $(pwd)/mysql_backup.sql

```