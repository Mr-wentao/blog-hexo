---
title: Bash中双横线的作用
abbrlink: 314a3942
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - Shell
date: 2021-08-17 17:43:49
---

看个例子：
> 假设有个文件叫`-f`， 我想把这个文件删除
> 假设我要用`rm -f -f`来删除，会发现无法删除，bash把第二个`-f`当作参数了

这个时候可以使用`--`(当然有其他方法，这里先不讨论)

```bash
rm -f -- -f
```

这里的`--` 表示这个程序的参数已经结束了，后面所有的内容都是参数的值了，比如第二个 `-f` 就不会认为它是rm的参数了

现在使用kubectl exec 也会推荐你用 -- 后面再接上命令
