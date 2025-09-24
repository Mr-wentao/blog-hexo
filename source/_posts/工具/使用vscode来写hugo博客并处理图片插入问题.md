---
title: 使用vscode来写hugo博客并处理图片插入问题
abbrlink: 2a39e018
categories:
  - 工具
tags:
  - hugo
  - vscode
  - markdown
  - Blog
  - 编辑器
date: 2022-03-30 00:39:13
---

如果对typora情有独钟的同学可以参考<https://zahui.fan/posts/b4cf69c3/>，不过我用来用去还是发现vscode好，哪怕不写代码，仅仅写文章也挺不错的。不过直接用的话有很多问题，我们还需要借助vscode强大的插件系统。

## 插入到static目录

### 插入图片问题

我们在写博客的时候，有时会有一些插入图片的需求，之前的做法是--截图保存到`static/images`目录，然后文章里面添加`![图片说明](https://s3.babudiu.com/iuxt//images/xxx.png)`，操作很繁琐，或者也可以使用图床，不过也挺麻烦的。我们可以用一款叫`paste image`的插件来简化我们的插入图片的操作。

假设你的博客图片放在仓库根目录的static/images目录下，博客文章在其他地方，需要修改

- 图片存放的位置：

    ![图片存放的位置](https://s3.babudiu.com/iuxt//images/2022-03-30-00-46-15.png)

- 图片的基础路径：

    即在markdown文件里面不显示static了，只从images开始显示

    ![图片的基础路径](https://s3.babudiu.com/iuxt//images/2022-03-30-00-48-30.png)

- 路径的前缀：

    如果不加的话，路径是类似于`![图片说明](images/xxx.png)`，我们想要的是`![图片说明](https://s3.babudiu.com/iuxt//images/xxx.png)`

    ![路径前缀](https://s3.babudiu.com/iuxt//images/2022-03-30-00-55-40.png)

以上修改完成后，就可以使用`ctrl+alt+v`键直接从电脑剪贴板粘贴了。

以上配置文件的修改也可以通过直接编辑json文件来进行

```json
{
    "pasteImage.basePath": "${projectRoot}/static",
    "pasteImage.path": "${projectRoot}/static/images",
    "pasteImage.prefix": "/"
}
```

### 避免blog仓库过大

blog仓库只保留文本文件，每次提交commit也是有意义的，但是像图片等就没必要这样了，所以static目录我是用了一个git submodule，当然还有一种方法是使用图床，放在github仓库里，使用jsdeliver进行CDN加速

## 使用图床

图床说白了就是个存图片的地方，可以通过http直链来访问，可以简化md编写和移动，可以使用[PicGo](https://picgo.github.io/PicGo-Doc/)来简化操作

我用的是github做图床，通过jsdelivr来进行CDN加速，我的配置文件如下（其中token需要在github后台生成）：

```json
{
  "picBed": {
    "current": "github",
    "uploader": "github",
    "smms": {
      "token": ""
    },
    "github": {
      "branch": "master",
      "customUrl": "https://cdn.jsdelivr.net/gh/iuxt/static",
      "path": "images/",
      "repo": "iuxt/static",
      "token": "xxxx"
    }
  },
  "settings": {
    "shortKey": {
      "picgo:upload": {
        "enable": true,
        "key": "CommandOrControl+Shift+P",
        "name": "upload",
        "label": "快捷上传"
      }
    },
    "server": {
      "port": 36677,
      "host": "127.0.0.1",
      "enable": true
    },
    "privacyEnsure": true,
    "showUpdateTip": true
  },
  "picgoPlugins": {},
  "debug": true,
  "PICGO_ENV": "GUI",
  "needReload": false
}
```

按下快捷键 ctrl + shift + p 会自动上传剪切板上的图片，然后将连接写入剪切板

## hugo命令

只需要将hugo.exe扔到path里就好了，我个人比较喜欢的做法是在家目录创建一个bin目录，然后把这个bin目录添加到path环境变量中，具体操作如下：

下载hugo.exe放到`%userprofile%\bin`中，然后

系统设置

![系统设置](https://s3.babudiu.com/iuxt//images/2022-03-30-01-01-09.png)

高级系统设置

![高级设置](https://s3.babudiu.com/iuxt//images/2022-03-30-01-02-08.png)

环境变量

![环境变量](https://s3.babudiu.com/iuxt//images/2022-03-30-01-02-16.png)
