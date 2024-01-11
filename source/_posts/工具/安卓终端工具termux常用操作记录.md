---
title: 安卓终端工具termux常用操作记录
abbrlink: fd0c5290
categories:
  - 工具
tags:
  - Android
  - 配置记录
date: 2021-03-01 15:53:39
---

> termux 是安卓平台模拟linux环境的工具，可以运行常用的linux工具

## 常用配置

```bash
# 修改软件源
termux-change-repo

# home目录添加storage, 可以访问手机里的文件
termux-setup-storage

# 修复shebang
termux-fix-shebang
```

### 修改用户环境变量

```bash
cat > ~/.profile <<-'EOF'
alias ll='ls -al'
alias l='ls -l'
EOF
```

### 虚拟根目录

```bash
cd $PREFIX
```

### 安装zsh

> 暂时有bug, 导致nodejs程序运行提示 找不到env, 可以执行`termux-fix-shebang`临时解决

```bash
sh -c "$(curl -fsSL https://github.com/Cabbagec/termux-ohmyzsh/raw/master/install.sh)"
```

### 登录提示语

```bash
vim $PREFIX/etc/motd
```

> 可以配合screenfetch食用

```bash
pkg install screenfetch
```

### 定制屏幕上的按键

```bash
[ -d ~/.termux/ ] || mkdir ~/.termux/

cat > ~/.termux/termux.properties <<-'EOF'
extra-keys = [ \
['ESC','|','`','HOME','UP','END','$'], \
['TAB','CTRL','~','LEFT','DOWN','RIGHT','ENTER'] \
]
EOF
```

## 包管理

### pkg

> Termux除了支持apt命令外,还在此基础上封装了pkg命令,pkg命令向下兼容apt命令

```bash
pkg search <query>              搜索包
pkg install <package>           安装包
pkg uninstall <package>         卸载包
pkg reinstall <package>         重新安装包
pkg update                      更新源
pkg upgrade                     升级软件包
pkg list-all                    列出可供安装的所有包
pkg list-installed              列出已经安装的包
pkg shoe <package>              显示某个包的详细信息
pkg files <package>             显示某个包的相关文件夹路径
```

### apt

参考 ubuntu 的 apt

### 安装常用工具

```bash
pkg update && pkg install -y git vim openssh curl wget python tar
```

## 安装vscode

```bash
pkg install python nodejs yarn
yarn global add code-server
```

## 安装完整版Linux

```bash
pkg install proot-distro

# 查看可以安装的发行版
proot-distro list
proot-distro install ubuntu

# 进入ubuntu
proot-distro login ubuntu
```

> 将`proot-distro login ubuntu`写入到`~/.profile`可以打开软件自动进入ubuntu系统
