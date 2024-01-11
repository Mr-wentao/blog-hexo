---
title: WSL2 配置记录
categories:
  - Windows
tags:
  - Windows
  - WSL
  - wsl2
  - 配置记录
abbrlink: lmeiruso
date: 2023-09-11 14:45:16
---

## 基础环境配置

### 更换源

使用中科大的源: <https://mirrors.ustc.edu.cn/help/ubuntu.html>

```bash
sudo sed -i 's@//.*.ubuntu.com@//mirrors.ustc.edu.cn@g' /etc/apt/sources.list
```

### 安装常用的包

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y libmysqlclient-dev build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev lrzsz
```


### 当前用户免sudo密码

```bash
sudo tee /etc/sudoers.d/iuxt <<-EOF
%sudo   ALL=(ALL:ALL) NOPASSWD:ALL
$USER   ALL=(ALL:ALL) NOPASSWD:ALL
EOF
```

### WSL 开启 systemd 支持(仅支持WSL2)

```bash
sudo touch /etc/startup.sh
sudo chmod +x /etc/startup.sh
sudo tee /etc/wsl.conf <<-'EOF'
[boot]
systemd=true
command=/etc/startup.sh
EOF
```

## git 配置

```bash
sudo apt install -y git git-lfs
```


```bash
tee ~/.gitconfig <<-'EOF'
[user]
        name = zhanglikun
        email = x@zahui.fan
        signingkey = zhanglikun
[credential]
        helper = store
[core]
        autocrlf = input
        quotepath = false
[init]
        defaultBranch = master
[pull]
        rebase = false
[commit]
        gpgsign = false
EOF
```


## zsh配置

### 安装zsh

```bash
sudo apt install -y zsh
```

### 安装oh my zsh

<https://ohmyz.sh/#install>

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### 安装主题

<https://github.com/romkatv/powerlevel10k>

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 修改主题配置
curl -OL https://file.babudiu.com/f/5Ds6/.p10k.zsh
curl -OL https://file.babudiu.com/f/65ty/.zshrc
touch ~/.rc
mv .p10k.zsh ~
mv .zshrc ~
sed -i 's#^ZSH_THEME=.*#ZSH_THEME="powerlevel10k/powerlevel10k"#g' ~/.zshrc
```


### 安装一些插件

<https://github.com/zsh-users/zsh-autosuggestions>

```bash
sudo apt install -y fzf
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
omz plugin enable z git sudo zsh-autosuggestions zsh-syntax-highlighting fzf
```

## vim

### 修改默认编辑器

```bash
# sudo update-alternatives --config editor
sudo ln -sf /usr/bin/vim.basic /etc/alternatives/editor

# select-editor
echo 'SELECTED_EDITOR="/usr/bin/vim.basic"' > ~/.selected_editor
```

### 安装vim plug插件管理工具

```bash
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

配置文件

```bash
tee ~/.vimrc <<-'EOF'
call plug#begin()

" On-demand loading
Plug 'preservim/nerdtree', { 'on': 'NERDTreeToggle' }
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'

call plug#end()


set paste
"set number

" nerdtree
let NERDTreeWinPos="left"
noremap <F8> :NERDTreeToggle<CR>
let g:NERDTreeDirArrowExpandable = '▸'
let g:NERDTreeDirArrowCollapsible = '▾'


" airline
set laststatus=2  "永远显示状态栏
let g:airline_powerline_fonts = 1  "支持 powerline 字体
let g:airline#extensions#tabline#enabled = 1 "显示窗口tab和buffer
let g:airline_theme='molokai'

if !exists('g:airline_symbols')
let g:airline_symbols = {}
endif
let g:airline_left_sep = '▶'
let g:airline_left_alt_sep = '❯'
let g:airline_right_sep = '◀'
let g:airline_right_alt_sep = '❮'
let g:airline_symbols.linenr = '¶'
let g:airline_symbols.branch = '⎇'
EOF
```

进入vim命令界面, 输入 `:PlugInstall` 安装插件

## 常用环境安装

安装dockekr golang python nodejs 查看 [快速搭建环境记录](/posts/5e168f7e)

安装zssh, 查看 [改造windows-terminal支持lrzsz](/posts/e48170f8)