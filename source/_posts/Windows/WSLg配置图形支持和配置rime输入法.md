---
title: WSLg配置图形支持和配置rime输入法
categories:
  - Windows
tags:
  - Windows
  - WSL
  - 配置记录
abbrlink: '81886814'
date: 2023-06-07 14:50:20
---

WSLg是微软的wsl2中自带的显示图形界面的功能，可以和windows完美融合在一块，不过由于wsl系统比较精简，会缺少一些图形包和输入法等。

## 设置中文显示

### 安装依赖包

```bash
# 安装中文字体
sudo apt install language-pack-zh-hans fonts-noto-cjk fonts-noto-cjk-extra

# locales 配置 en_US.UTF-8 和 zh_CN.UTF-8 
sudo sed -i 's/^# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/g' /etc/locale.gen
sudo sed -i 's/^# zh_CN.UTF-8 UTF-8/zh_CN.UTF-8 UTF-8/g' /etc/locale.gen

sudo locale-gen
```

### 设置显示语言为中文

```bash
sudo tee /etc/default/locale <<-'EOF'
LANG=zh_CN.UTF-8
LANGUAGE="zh_CN:zh:en_US:en"
EOF
```

## 配置中文输入法

### 安装im-config

```bash
sudo apt install zenity im-config
im-config
# 选择fcitx5，其余都选OK
```

### 安装中文输入法

```bash
sudo apt install fcitx5 fcitx5-chinese-addons fcitx5-frontend-gtk4 fcitx5-frontend-gtk3 fcitx5-frontend-gtk2 fcitx5-frontend-qt5 fcitx5-config-qt
```

### 配置环境变量

需要修改profile文件， 开机自启动fcitx5和设置环境变量， 注意以下适用于bash，如果是zsh，则对应的路径是`/etc/zsh/zprofile`

```bash
sudo tee -a /etc/profile <<-'EOF'
/usr/bin/fcitx5 --disable=wayland -d --verbose '*'=0
export INPUT_METHOD=fcitx
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
export SDL_IM_MODULE=fcitx
export GLFW_IM_MODULE=ibus
EOF
```

重启一下wsl


### 增加输入法

```bash
fcitx5-configtool
```

在界面中去掉默认输入法，增加中文输入法

### 配置常用脚本

由于wsl的图形界面不完整，没办法在任务栏右击输入法图标的方式来执行 部署 或 同步 任务，所以通过脚本来实现。

同步脚本：

> 同步位置配置在`~/.local/share/fcitx5/rime/installation.yaml` 内的 `sync_dir: "/mnt/c/Users/iuxt/OneDrive/sync/rime_sync`"

```bash
#!/bin/bash
pkill fcitx5
cd ~/.local/share/fcitx5/rime/
rime_dict_manager -s
/usr/bin/fcitx5 --disable=wayland -d --verbose '*'=0
```

部署脚本：

```bash
#!/bin/bash
pkill fcitx5
rime_deployer --build ~/.local/share/fcitx5/rime/ /usr/share/rime-data ~/.local/share/fcitx5/rime/build
/usr/bin/fcitx5 --disable=wayland -d --verbose '*'=0
```
