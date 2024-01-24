---
title: Linux Shell 自动补全
abbrlink: 7ce4e1fc
categories:
  - linux
tags:
  - kubectl
date: 2022-02-27 18:17:43
---

一直使用kubectl操作k8s集群，每次都需要查看pod名字、查看service名字等，比较麻烦，看了kubectl官方就支持bash自动补全，所以记录一下。

官方文档地址：<https://kubernetes.io/zh/docs/tasks/tools/included/optional-kubectl-configs-bash-linux/>

本文以Ubuntu20.04下的kubectl为例

## Bash自动补全

kubectl 的 Bash 补全脚本可以用命令 kubectl completion bash 生成。 在 shell 中导入（Sourcing）补全脚本，将启用 kubectl 自动补全功能。

然而，补全脚本依赖于工具 `bash-completion`， 所以要先安装它（可以用命令 `type _init_completion` 检查 `bash-completion` 是否已安装）。

### 安装 bash-completion

很多包管理工具均支持 bash-completion。 可以通过 `apt-get install bash-completion` 或 `yum install bash-completion` 等命令来安装它。

上述命令将创建文件 `/usr/share/bash-completion/bash_completion`，它是 bash-completion 的主脚本。 依据包管理工具的实际情况，你需要在 ~/.bashrc 文件中手工导入此文件。

> 用户级和系统级二选一，用户级表示系统内所有用户都生效，用户级只对当前用户生效

### 用户级别开启bash_completion

在`~/.bashrc`最后面添加两行

```bash
source /usr/share/bash-completion/bash_completion
source <(kubectl completion bash)
```

### 系统层级开启bash_completion

把`/etc/bash.bashrc`如下几行的注释取消

```bash
# enable bash completion in interactive shells
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi
```

bash-completion 负责导入 `/etc/bash_completion.d` 目录中的所有补全脚本。

```bash
kubectl completion bash | sudo tee /etc/bash_completion.d/kubectl > /dev/null
```

### 关联kubectl别名

如果 kubectl 有关联的别名，你可以扩展 shell 补全来适配此别名：

```bash
echo 'alias k=kubectl' >>~/.bashrc
echo 'complete -F __start_kubectl k' >>~/.bashrc
```

## ZSH自动补全

kubectl 通过命令 kubectl completion zsh 生成 Zsh 自动补全脚本。 在 shell 中导入（Sourcing）该自动补全脚本，将启动 kubectl 自动补全功能。

为了在所有的 shell 会话中实现此功能，请将下面内容加入到文件 `~/.zshrc` 中。

```bash
source <(kubectl completion zsh)
```

如果你为 kubectl 定义了别名，可以扩展脚本补全，以兼容该别名。

```bash
echo 'alias k=kubectl' >>~/.zshrc
echo 'compdef __start_kubectl k' >>~/.zshrc
```

重新加载 shell 后，kubectl 自动补全功能将立即生效。

如果你收到 `complete:13: command not found: compdef` 这样的错误提示，那请将下面内容添加到 `~/.zshrc` 文件的开头：

```bash
autoload -Uz compinit
compinit
```
