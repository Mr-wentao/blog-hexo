---
title: Linux终端复用器Screen和tmux
categories:
  - 工具
tags:
  - cli
  - Shell
  - Linux
abbrlink: lm9yw00q
date: 2023-09-08 10:17:32
---
参考阮一峰的博客<https://www.ruanyifeng.com/blog/2019/10/tmux.html>

## 作用

想象一下, 我在自己电脑远程SSH连接服务器, 正在命令行执行mysqldump, 突然(断网\电脑蓝屏)了, 那么终端就断了, mysqldump也就断了, 就需要重新来过. 终端复用器就是创建一个虚拟的终端, 可以挂在后台, 随时想进就进, 还有其他好用的功能, 比如将终端日志保存到文件内.

常用的工具有tmux和screen, tmux类似于screen, 但是功能更强大, screen 的记录日志功能很好用, 两者各有千秋. 另外终端复用器对`rz/sz`这种工具的兼容性都不好, 建议不要用来进行`rz/sz`传文件
## tmux

### 安装

```bash
# centos
yum install -y tmux

# ubuntu
apt-get install -y tmux
```

## 快速使用
输入 `tmux` 即可启动, 在终端下面有一条状态栏, 显示当前的终端编号.
![](https://s3.babudiu.com/iuxt//images/202309081022830.png)

退出输入: `exit` 或者按下 `Ctrl + d`
查看后台运行的会话: `tmux ls`
进入会话: `tmux attach -t 0`
### 常用操作

| 操作                       | 命令或快捷键                        |
| -------------------------- | ----------------------------------- |
| 打开tmux                   | tmux                                |
| 新建tmux并起名字           | tmux new -s 会话的名字              |
| 分离会话(放在后台)         | Ctrl+b d                            |
| 查看所有会话列表           | tmux ls                             |
| 进入会话(编号或名字都可以) | tmux attach -t 0/会话名字           |
| 杀死会话                   | tmux kill-session -t 0/会话名字     |
| 切换会话                   | tmux switch -t 0/会话名字           |
| 重命名会话                 | tmux rename-session -t 0 会话新名字 |

## screen

### 安装

```bash
# ubuntu
apt-get install screen

# centos
yum install screen
```

## 基本使用

| 操作                   | 命令或快捷键                           |
| ---------------------- | -------------------------------------- |
| 打开screen             | screen                                 |
| 放在后台               | Ctrl + a d                             |
| 查看后台的会话         | screen -ls                             |
| 进入后台会话           | screen -r pid号(screen -ls 可以查看到) |
| 创建一个收集日志的会话 | screen -L (日志在当前目录, screen开头的log文件)                                       |

