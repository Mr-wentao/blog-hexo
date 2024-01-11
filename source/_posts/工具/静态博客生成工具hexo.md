---
title: 静态博客生成工具hexo
abbrlink: ab21860c
categories:
  - 工具
tags:
  - Blog
  - hexo
date: 2021-02-02 17:28:26
---

> 博主已经放弃hexo了，请看[hugo](/tags/hugo)

## 安装nodejs yarn hexo

> 推荐使用yarn来代替npm
首先安装nodejs，和npm, 然后再安装yarn

### 安装yarn

```bash
npm install -g yarn
```

### 设置淘宝源

```bash
yarn config set registry https://registry.npm.taobao.org -g
```

### 安装hexo

```bash
yarn global add hexo-cli
```

### 创建新项目

> 如果找不到hexo,请把 `yarn global bin` 添加到环境变量

```bash
hexo init myblog
```

## 修改配置

### 修改语言为中文

vim myblog/_config.yml

```yml
# Site
title: 张理坤的博客
subtitle: '飞机师的风衣'
keywords:
author: 张理坤
language: zh-CN
timezone: 'Asia/Shanghai'
```

### 安装next主题

github地址：<https://github.com/theme-next/hexo-theme-next>

```bash
git clone https://github.com/theme-next/hexo-theme-next themes/next
```

修改theme配置文件 vim next/_config.yml
`scheme: Pisces`

### 添加搜索功能

```bash
yarn add hexo-generator-searchdb
```

然后主题配置文件next/_config.yml
`local_search:`标签，配置参数`enable: true`

### 添加看板娘

> git 地址： <https://github.com/EYHN/hexo-helper-live2d/blob/master/README.zh-CN.md>

```bash
yarn add hexo-helper-live2d
yarn add live2d-widget-model-epsilon2_1
```

在 _config.yml 添加下面配置

```yml
live2d:
  enable: true
  scriptFrom: local
  pluginRootPath: live2dw/
  pluginJsPath: lib/
  pluginModelPath: assets/
  tagMode: false
  log: false
  model:
    use: live2d-widget-model-epsilon2_1
  display:
    position: right
    width: 150
    height: 300
  mobile:
    show: true
  react:
    opacity: 0.7
```

> module.use里面的和你安装的要一样

### 设置头像

- 将图片放入 博客目录/themes/next/source/images，并重命名为 avatar.[格式]
- 编辑主题配置文件_config.yml
  `vim 博客目录/themes/next/_config.yml`

```yml
avatar: /images/avatar.png
```

### 添加分类和标签

#### 分类

`hexo new page categories`
成功后会提示：

```sh
INFO  Created: ~/Documents/blog/source/categories/index.md
```

添加`type: "categories"`到index.md中:

```md
---
title: 文章分类
date: 2017-05-27 13:47:40
type: "categories"
---
```

给文章添加“categories”属性
打开需要添加分类的文章，为其添加categories属性。
注意：hexo一篇文章只能属于一个分类，如果写两个分类，则是给分类嵌套

```md
---
title: hexo
abbrlink: ab21860c
date: 2021-02-02 17:28:26
---
```

#### 标签

生成“标签”页并添加tpye属性
打开命令行，进入博客所在文件夹。执行命令

```bash
hexo new page tags
```

成功后会提示：

```bash
INFO  Created: ~/Documents/blog/source/tags/index.md
```

根据上面的路径，找到index.md这个文件, 添加`type: "tags"`

```md
---
title: 文章分类
date: 2017-05-27 13:47:40
type: "tags"
---
```

文章添加`tags`

```md
---
title: hexo
abbrlink: ab21860c
date: 2021-02-02 17:28:26
---
```

### 添加图片

安装插件

```bash
yarn add https://github.com/iuxt/hexo-asset-image.git
```

vim myblog/_config.yml

```yml
post_asset_folder: true
```

创建新文章

```bash
hexo new test
```

使用

将图片放在同名文件夹, 在md里面引用

```md
![pilot](pilot.jpg)
```

### 自定义域名

1. 在`source`目录添加`CNAME`文件，文件内容是你的域名

2. 添加解析CNAME到github的域名

## 开始写文章

### 新创建文章

`hexo new <标题>`

然后编辑 `vim source/_posts/<标题>.md`

### 本地查看效果

`hexo s`

### 发布文章

安装git插件

```bash
yarn add hexo-deployer-git
```

修改hexo配置文件 vim hexo/_config.yml，配置git地址

```yml
theme: next

deploy:
  type: 'git'
  repo: ['git@gitee.com:iuxt/iuxt.git', 'git@github.com:iuxt/iuxt.github.io.git']
  branch: master
  message: 'hexo update'
```

发布

```bash
hexo clean && hexo d
```

## 优化

### url格式优化

> 有人给我评论了, 但是后面我更新了一下目录结构, 发现评论丢失了, 究其原因是因为文章的url变了，所以想将文章的url固定下来，也便于seo
> 默认的生成规则是：`:year/:month/:day/:title`，是按照年、月、日、标题来生成的。比如：`https://iuxt.gitee.io/2021/05/08/%E5%B7%A5%E5%85%B7/adb%E5%B8%B8%E7%94%A8%E6%93%8D%E4%BD%9C/`

#### 安装插件

```bash
yarn global add hexo-abbrlink
```

vim config.yml

```yml
permalink: :abbrlink/
# abbrlink config
abbrlink:
  alg: crc32  # 算法：crc16(default) and crc32
  rep: hex    # 进制：dec(default) and hex
```

## seo

### robots.txt

在`source`目录下创建`robots.txt`文件

```js
# welcome to : iuxt.github.io
User-agent: *
Allow: /
Allow: /archives/
Allow: /categories/
Allow: /about/

Disallow: /js/
Disallow: /css/
Disallow: /fonts/
Disallow: /vendors/
Disallow: /lib/
Sitemap: https://iuxt.github.io/sitemap.xml
```

### sitemap.xml

安装插件

```bash
yarn add hexo-generator-sitemap
yarn add hexo-generator-baidu-sitemap
```

`themes/next/_config.yml`添加

```yml
baidusitemap:
    path: baidusitemap.xml
sitemap:
    path: sitemap.xml
```

然后`hexo g`, 看下`public`目录下有没有生成`sitemap.xml`和`baidusitemap.xml`文件
