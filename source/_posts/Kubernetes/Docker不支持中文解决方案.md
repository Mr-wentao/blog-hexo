---
title: Docker不支持中文解决方案
abbrlink: 581a1bd9
categories:
  - Kubernetes
tags:
  - Container
  - 编码
  - Docker
cover: 'https://static.zahui.fan/images/202211011524478.png'
date: 2021-11-04 10:29:11
---



> ubuntu官方镜像默认的字符集支持`C`, `C.UTF-8`, and `POSIX`

查看容器使用的字符集

```shell
root@huige-demo-web-0:/var/www/html/forum/files# locale
LANG=
LANGUAGE=
LC_CTYPE="POSIX"
LC_NUMERIC="POSIX"
LC_TIME="POSIX"
LC_COLLATE="POSIX"
LC_MONETARY="POSIX"
LC_MESSAGES="POSIX"
LC_PAPER="POSIX"
LC_NAME="POSIX"
LC_ADDRESS="POSIX"
LC_TELEPHONE="POSIX"
LC_MEASUREMENT="POSIX"
LC_IDENTIFICATION="POSIX"
LC_ALL=
```

要使容器内进程可以打开中文文件，需要将`locale`设置成`C.UTF-8`即可

修改`Dockerfile`，添加`ENV`

```dockerfile
ENV LANG C.UTF-8
```

重新构建，运行，再次查看`locale`

```shell
root@4d4501013874:/# locale
LANG=c.utf8
LANGUAGE=
LC_CTYPE="c.utf8"
LC_NUMERIC="c.utf8"
LC_TIME="c.utf8"
LC_COLLATE="c.utf8"
LC_MONETARY="c.utf8"
LC_MESSAGES="c.utf8"
LC_PAPER="c.utf8"
LC_NAME="c.utf8"
LC_ADDRESS="c.utf8"
LC_TELEPHONE="c.utf8"
LC_MEASUREMENT="c.utf8"
LC_IDENTIFICATION="c.utf8"
LC_ALL=
```

如果想让容器内可以正常显示中文（应该没人想这么干吧），需要先安装`locale`然后将`locale`设置成`zh_CN.UTF-8`

修改`Dockerfile`，添加

```dockerfile
RUN apt-get update && apt-get install -y locales && rm -rf /var/lib/apt/lists/* \
    && localedef -i zh_CN -c -f UTF-8 -A /usr/share/locale/locale.alias zh_CN.UTF-8
ENV LANG zh_CN.utf8
```

然后就可以完美显示中文了
