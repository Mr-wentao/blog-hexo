---
title: Windows恢复环境Windows RE
abbrlink: c0eb591c
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - Windows
date: 2021-03-10 17:30:10
---

## reagentc 命令

```bat
reagentc /disable       禁用windowsRE
reagentc /enable        启用windowsRE
reagentc /info          查看windowsRE状态
reagentc /boottore      将系统配置为在下次系统启动时启动 Windows RE
```

## 重新启用windowsRE

> 因为各种原因，比如手动删除了winre分区， 使用 `reagentc /info` 查看发现RE已经没有了，可以手动创建RE

### 找到winre.wim镜像

找到和你系统同版本的安装镜像， 提取其中的 `source\install.wim` 文件, 用解压缩软件打开install.wim文件, 解压其中的 `windows/system32/recovery/winre.wim`， 我们需要的就是一个`winre.wim`文件。

### 创建winre分区

管理员权限运行diskpart命令

```bat
create partition primary size=1024
format quick fs=ntfs label="Recovery"
assign letter="R"
```

### 创建WinRE目录

```bat
mkdir R:\Recovery\WindowsRE
```

此时将文件放入 `R:\Recovery\WindowsRE` 中

然后执行：

```bat
reagentc /setreimage /path R:\Recovery\WindowsRE
```

### 设置磁盘属性

管理员权限运行diskpart命令

```bat
list disk             # 查看磁盘id
select disk 0         # 选择你的系统磁盘
list partition        # 查看分区id
select partition 5    # 选择恢复分区的id
set id="de94bba4-06d1-4d40-a16a-bfd50179d6ac"
gpt attributes=0x8000000000000001
```

### 启用winre

```bat
reagentc /enable
reagentc /info
```