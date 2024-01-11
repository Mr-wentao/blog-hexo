---
title: Hugo博客添加live2d看板娘
abbrlink: 23f4c55d
categories:
  - 工具
tags:
  - Blog
  - hugo
date: 2021-06-30 13:12:32
---

> 看板娘就是网页上面漂浮的小人，可以随着鼠标的移动而做出反应，在hexo上面是有现成的npm module，在hugo上面只能自己引入js啦。

我用的是`hugo v0.84.1-4BD65E22+extended`， LoveIt版本是0.2.10

## 方法1: 使用html模板，引入js文件

编辑`themes/LoveIt/layouts/partials/footer.html` ， 在 `{{- end -}}` 的上一行添加

```html
<!-- Live2D，网页上的小人，可以修改live2d_config.js来修改模型，模型都在static/live2d_models里面 -->
<!-- 你也可以把js文件下载下来，放到static/js/目录下，就不依赖别人的服务了 -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.0.min.js"></script>

<script type="text/javascript">
    L2Dwidget.init({
        model: {
            scale: 1,
            hHeadPos: 0.5,
            vHeadPos: 0.618,
            jsonPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hibiki@1.0.5/assets/hibiki.model.json',       // xxx.model.json 的路径,换人物修改这个
        },
        display: {
            superSample: 1,     // 超采样等级
            width: 120,         // canvas的宽度
            height: 300,        // canvas的高度
            position: 'left',   // 显示位置：左或右
            hOffset: 0,         // canvas水平偏移
            vOffset: 0,         // canvas垂直偏移
        },
        mobile: {
            show: true,         // 是否在移动设备上显示
            scale: 1,           // 移动设备上的缩放
            motion: true,       // 移动设备是否开启重力感应
        },
        react: {
            opacityDefault: 1,  // 默认透明度
            opacityOnHover: 1,  // 鼠标移上透明度
        },
     });
</script>
```

## 方法2: 直接在config.toml里面引入js文件

`vim config.toml`， 要确保里面的js文件可以直接访问

```toml
    # 第三方库配置
    [params.page.library]
      [params.page.library.css]
      [params.page.library.js]
        live2d-widget1 = "https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js"
        live2d-widget2 = "https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.0.min.js"
        live2d-config = "/js/live2d_config.js"
```

`vim static/js/live2d_config.js`

```js
    L2Dwidget.init({
        model: {
            scale: 1,
            hHeadPos: 0.5,
            vHeadPos: 0.618,
            jsonPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hibiki@1.0.5/assets/hibiki.model.json',       // xxx.model.json 的路径,换人物修改这个
        },
        display: {
            superSample: 1,     // 超采样等级
            width: 120,         // canvas的宽度
            height: 300,        // canvas的高度
            position: 'left',   // 显示位置：左或右
            hOffset: 0,         // canvas水平偏移
            vOffset: 0,         // canvas垂直偏移
        },
        mobile: {
            show: true,         // 是否在移动设备上显示
            scale: 1,           // 移动设备上的缩放
            motion: true,       // 移动设备是否开启重力感应
        },
        react: {
            opacityDefault: 1,  // 默认透明度
            opacityOnHover: 1,  // 鼠标移上透明度
        },
     });
```
