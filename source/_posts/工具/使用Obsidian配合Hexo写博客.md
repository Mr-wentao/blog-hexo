---
title: 使用Obsidian配合Hexo写博客
categories:
  - 工具
tags:
  - Blog
  - hexo
  - 编辑器
  - markdown
abbrlink: ldle4xfe
cover: 'https://static.zahui.fan/images/202301302341290.png'
date: 2023-02-01 16:12:30
---

obsidian是一款好用的markdown编辑器， 用来记笔记还是不错的。 并且支持插件系统，可以通过模板来生成博客的frontmatter， 省去了`hexo new`的操作 所以准备配置一下用obsidian来写博客。

相关文章：
[静态博客生成工具hexo](/posts/ab21860c)
[使用typora更好更快地写hugo博客](/posts/b4cf69c3)
[使用vscode来写hugo博客并处理图片插入问题](/posts/2a39e018)

## 打开仓库

首先使用obsidian打开`source/_posts`目录， 然后会生成一些配置文件。进入`_posts`目录

创建.gitignore将一些临时文件排除掉。

```.gitignore
.obsidian/workspace.json
```

## 配置模板

自带的模板插件功能太单一了， 我们关闭安全模式， 安装第三方插件`Templater`

创建`Templates`目录，修改配置指定Template的目录。修改配置项`Template folder location`为`Templates`

然后再此目录下创建`Front-matter.md`文件，此文件用作hexo的frontmatter模板。

```yaml
---
title: <% tp.file.title %>
categories:
  - <% tp.file.folder(relative=true) %>
tags:
  - ''
abbrlink: <% tp.user.get_guid() %>
date: <% tp.date.now(format="YYYY-MM-DD HH:mm:ss") %>
---
```

其中：

|模板|作用|
|---|---|
|tp.file.title                   |          获取到的就是文件名|
|tp.file.folder(relative=true) | 是获取文件所在的相对路径，就是所在目录名字|
|tp.user.get_url()            |    是自定义方法，脚本后面展示，用于自动生成博客的url|
|tp.date.now(format="YYYY-MM-DD HH:mm:ss")  |以指定格式格式化时间|

详细的变量使用请查看`Templater`官方文档<https://silentvoid13.github.io/Templater/>

## 自定义脚本

创建目录`Scripts`， 然后在设置里配置`Script files folder location`为`Scripts`

获取GUID脚本 `Scripts/get_url.js`

```javascript
function generateTimestampUrl() {
  var timestamp = new Date().getTime();
  var url = timestamp.toString(36)
  return url;
}

module.exports = generateTimestampUrl;
```

然后每次创建新markdown文件的时候，只需要点击templater按钮， 然后就会自动生成我们需要的frontmatter， 就不用 hexo new 了

## 渲染时排除这些目录

在主配置文件中 `_config.yml`

```yml
skip_render: 
# 这里排除的是obsidian编辑器需要的文件
  - '_posts/.obsidian/*'
  - '_posts/Scripts/*'
  - '_posts/Templates/*'
  - '**/README.md'
```

## 使用git插件进行同步

安装`Obsidian GIT` 插件
按下快捷键`CTRL + P` 选择 commit all changes ， 然后选择 `push` 即可发布。

## 使用image-auto-upload-plugin来处理图片

默认情况下obsidian插入图片会插入到附件文件夹, 安装此插件会自动调用picgo或者piclist来进行文件上传并复制markdown语法到文件中.