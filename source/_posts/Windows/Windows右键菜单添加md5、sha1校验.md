---
title: Windows右键菜单添加md5、sha1校验
abbrlink: 19e40a49
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - Windows
date: 2021-03-11 10:47:26
---

> 此方法依赖powershell, win10没问题，win7没测试

## 安装

```bat
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\*\shell\hash]
"MUIVerb"="校验文件 Hash"
"SubCommands"=""
"Icon"="PowerShell.exe"

; SHA1
[HKEY_CLASSES_ROOT\*\shell\hash\shell\01menu]
"MUIVerb"="SHA1"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\01menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA1 | format-list"

; SHA256
[HKEY_CLASSES_ROOT\*\shell\hash\shell\02menu]
"MUIVerb"="SHA256"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\02menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA256 | format-list"

; SHA384
[HKEY_CLASSES_ROOT\*\shell\hash\shell\03menu]
"MUIVerb"="SHA384"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\03menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA384 | format-list"

; SHA512
[HKEY_CLASSES_ROOT\*\shell\hash\shell\04menu]
"MUIVerb"="SHA512"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\04menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA512 | format-list"

; MACTripleDES
[HKEY_CLASSES_ROOT\*\shell\hash\shell\05menu]
"MUIVerb"="MACTripleDES"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\05menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm MACTripleDES | format-list"

; MD5
[HKEY_CLASSES_ROOT\*\shell\hash\shell\06menu]
"MUIVerb"="MD5"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\06menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm MD5 | format-list"

; RIPEMD160
[HKEY_CLASSES_ROOT\*\shell\hash\shell\07menu]
"MUIVerb"="RIPEMD160"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\07menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm RIPEMD160 | format-list"

; Allget-filehash -literalpath '%1' -algorithm RIPEMD160 | format-list
[HKEY_CLASSES_ROOT\*\shell\hash\shell\08menu]
"CommandFlags"=dword:00000020
"MUIVerb"="校验全部"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\08menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA1 | format-list;get-filehash -literalpath '%1' -algorithm SHA256 | format-list;get-filehash -literalpath '%1' -algorithm SHA384 | format-list;get-filehash -literalpath '%1' -algorithm SHA512 | format-list;get-filehash -literalpath '%1' -algorithm MACTripleDES | format-list;get-filehash -literalpath '%1' -algorithm MD5 | format-list;get-filehash -literalpath '%1' -algorithm RIPEMD160 | format-list"
```

> 不过要注意的是，自己复制代码保存时，编码必须选择“**UTF-16 LE**”格式，否则右键菜单的中文会乱码。

## 卸载

```bat
Windows Registry Editor Version 5.00

[-HKEY_CLASSES_ROOT\*\shell\hash]
```
