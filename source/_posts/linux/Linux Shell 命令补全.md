---
title: Linux Shell 命令补全
categories:
  - linux
tags:
  - kubectl
date: 2022-02-27 18:17:43
---
```
kubectl操作k8s集群，如何自动补全pod、service名字?
kubectl的命令补全主要依赖于bash自动补全。
```
##### 用户层级Bash自动补全
```bash
yum install -y bash-completion
source /usr/share/bash-completion/bash_completion
source <(kubectl completion bash)
echo "source <(kubectl completion bash)" >> ~/.bashrc
```

##### 系统层级开启bash_completion

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

##### 关联kubectl别名

如果 kubectl 有关联的别名，你可以扩展 shell 补全来适配此别名：

```bash
echo 'alias k=kubectl' >>~/.bashrc
echo 'complete -F __start_kubectl k' >>~/.bashrc
```

##### ZSH自动补全

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
