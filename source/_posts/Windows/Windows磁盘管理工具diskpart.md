---
title: Windows磁盘管理工具diskpart
abbrlink: 24b2eef7
categories:
  - Windows
tags:
  - Windows
date: 2021-02-26 15:48:33
---
## 创建EFI 分区

```bat
diskpart
list disk
select disk x
create partition efi size=100
assign letter="b"
format quick fs=FAT32
```

## 创建msr分区

```bat
create partition msr size=16
```

## 创建Recovery 分区 (WindowsRE)

```bat
create partition primary size=1024
format quick fs=ntfs label="Recovery"
assign letter="R"
set id="de94bba4-06d1-4d40-a16a-bfd50179d6ac"
gpt attributes=0x8000000000000001
```

## 删除winre分区

```bat
select partition 5
delete partition override
```

## 使用bat脚本自动化创建分区

diskpart_config.txt

```bat
rem 选择磁盘,并清空所有分区
list disk
select disk 0
clean

rem 转换成gpt
convert gpt

rem 创建efi分区
create partition efi size=100
format quick fs=FAT32

rem 创建msr分区
create partition msr size=16

rem 创建Recovery分区
create partition primary size=1024
format quick fs=ntfs label="Recovery"
set id="de94bba4-06d1-4d40-a16a-bfd50179d6ac"
gpt attributes=0x8000000000000001
```

diskpart.bat

```bat
diskpart /s diskpart_config.txt
```
