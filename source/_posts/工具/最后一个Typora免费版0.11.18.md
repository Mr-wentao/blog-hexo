---
title: 最后一个Typora免费版0.11.18
abbrlink: 64b52e0d
cover: 'https://static.zahui.fan/images/202303181541059.png'
categories:
  - 工具
tags:
  - Markdown
  - GUI
  - Tools
  - 编辑器
date: 2021-12-10 17:41:31
---

> Typora是一个所见即所得的Markdown跨平台写作工具，目前已经发布正式版，并且更改为付费模式，0.11.18_beta是最后一个免费的测试版，有需要的可以选择下载。

## Windows用户

下载地址： ~~<https://github.com/iuxt/src/releases/download/2.0/typora-0-11-18.exe>~~

0.11.18现在被远程施法了，会提示过期无法使用,可以使用0.9.96版

下载地址1：<https://github.com/iuxt/src/releases/download/2.0/typora-setup-x64_0.9.96.exe>

下载地址2：<https://file.babudiu.com/f/x2ux/typora-setup-x64_0.9.96.exe>

## Mac用户

下载地址1： <https://github.com/iuxt/src/releases/download/2.0/typora-0-11-18.dmg>

下载地址2：<https://file.babudiu.com/f/vlsA/typora-0-11-18.dmg>

## Ubuntu用户

下载地址1：<https://github.com/iuxt/src/releases/download/2.0/Typora_Linux_0.11.18_amd64.deb>

下载地址2：<https://file.babudiu.com/f/yXCL/Typora_Linux_0.11.18_amd64.deb>

### 安装方法

使用apt安装：

```bash
sudo apt install ./Typora_Linux_0.11.18_amd64.deb
```

## 其他Linux用户（非debian系）

下载地址1：<https://github.com/iuxt/src/releases/download/2.0/typora-0-11-18.tar.gz>

下载地址2：<https://file.babudiu.com/f/w0ty/typora-0-11-18.tar.gz>

### 安装方法

解压
```bash
tar xf typora-0-11-18.tar.gz -C /opt/
```

创建桌面文件和图标

```ini
> vim ~/.local/share/applications/typora.desktop

[Desktop Entry]
Name=Typora
Comment=A minimal Markdown reading & writing app. Change Log: (https://typora.io/windows/dev_release.html)
GenericName=Markdown Editor
Exec=/opt/typora/Typora
Icon=/opt/typora/resources/assets/icon/icon_256x256@2x.png
Type=Application
Categories=Office;WordProcessor;Development;
MimeType=text/markdown;text/x-markdown;
```
