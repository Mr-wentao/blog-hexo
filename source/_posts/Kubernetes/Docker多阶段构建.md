---
title: Docker多阶段构建
cover: 'https://static.zahui.fan/images/202211011524478.png'
categories:
  - Kubernetes
tags:
  - Docker
  - Build
abbrlink: 4161b051
date: 2022-11-01 13:58:00
---

构建Docker镜像的时候,我们可以在机器上直接构建,也可以使用容器来构建,保证环境的统一性, 通过容器来构建会有一个问题,就是构建使用到的工具并不需要带入到真正的运行环境, 比如说使用nodejs的前端项目, 构建的时候需要nodejs或者npm, 但是运行的时候需要的是nginx. 多阶段构建即为构建完成后直接将代码塞进运行容器, 不会带入构建环境.

## 编写Dockerfile

vim Dockerfile

```dockerfile
FROM node:14.20.1-buster AS build
ADD argus-wfe /argus-wfe
WORKDIR /argus-wfe
RUN yarn && yarn run build


From nginx
COPY --from=build /argus-wfe/dist /usr/share/nginx/html
```
