---
title: Linux平台文本编辑器vim
abbrlink: 280100fb
categories:
  - 基础运维
tags:
  - Linux
date: 2021-04-21 15:54:57
---
![keymap](https://static.zahui.fan/images/vim_keymap.png)

## 替换文本

```bash
:%s#原文本#替换后的文本#g
:%s/原文本/替换后的文本/g
:%s@原文本@替换后的文本@g
```

## 匹配删除

删除包含特定字符的行

```bash
:g/pattern/d            # 全局范围内
:1,20g/pattern/d        # 删除1~20行内匹配的行
```

删除以#开头的注释

```vim
g/^#/d
```

删除空行

```vim
g/^\s*$/d
```

删除#后面的行

```vim
g/#.*/d
```

删除不匹配的行

```vim
:v/pattern/d
:g!/pattern/d
```

> patton里面可以是正则表达式，比如说 ^10.104

### 每一行最后添加一个字符

```vim
:%s/$/,/
```

### 用sudo打开

```vim
:w !sudo tee %
```

## 常用快捷键

| 快捷键 | 说明                        |
| ------ | --------------------------- |
| i      | 在当前光标之前插入          |
| a      | 在当前光标之后插入          |
| I      | 在当前行 最前面插入         |
| o      | 在下方新建一行, 然后插入    |
| O      | 在上方新建一行, 然后插入kao |
| G      | 跳到最后面                  |
| gg     | 跳到最前面                  |
| $      | 跳到行尾                    |
| ^      | 跳到行首                    |
| v      | 多选                        |
| ctrl v | 块选                        |
| V      | 行选                        |
| yy     | 复制一行                    |
| p      | 在光标后粘贴                |
| P      | 在光标前粘贴                |
| dd     | 截切一行                    |
| e      | 多选模式下   向后一个单词   |
| b      | 多选模式下   向前一个单词   |

## 命令模式

```vim
:wq     保存退出
:q      不保存退出
:q!     强制不保存退出
:x      保存退出

ZZ      保存退出，相当于:wq
ZQ      不保存退出，相当于:q!
```

## 配置文件

> 全局配置文件 `/etc/vim/vimrc`
> 当前用户配置文件 `~/.vimrc`

### 鼠标模式

> Vim7.1使用鼠标时会默认进入虚拟选中模式(visual mode)，就好像通过v选中的一样。

命令模式执行：

```vim
:set mouse-=a
```

或者将其写入配置文件里

## 分屏操作

| 操作                 | 命令                               |
| -------------------- | ---------------------------------- |
| 横向分屏             | :sp                                |
| 纵向分屏             | :vsp                               |
| 横向分屏并打开新文件 | :sp test.sh                        |
| 纵向分屏并打开新文件 | :vsp test.sh                       |
| 切到其他分屏         | 先按 Ctrl w 再按 hjkl 调整光标方向 |

## 安装插件

```bash
git clone https://github.com/preservim/nerdtree.git ~/.vim/pack/vendor/start/nerdtree
vim -u NONE -c "helptags ~/.vim/pack/vendor/start/nerdtree/doc" -c q
```

vim ~/.vimrc

```conf
let NERDTreeWinPos="left"
noremap <F10> :NERDTreeToggle<CR>
let g:NERDTreeDirArrowExpandable = '▸'
let g:NERDTreeDirArrowCollapsible = '▾'
```

> 快捷键设置为F10

## vim打开中文乱码

在`~/.vimrc`里增加几行：

```bash
set termencoding=utf-8
set encoding=utf8
set fileencodings=utf8,ucs-bom,gbk,cp936,gb2312,gb18030
```