---
title: Windows个人文件夹名字变英文
abbrlink: f6f77df5
cover: 'https://static.zahui.fan/images/windows.jpg'
categories:
  - Windows
tags:
  - Windows
date: 2021-07-22 09:19:04
---

> 有时候windows用户文件夹里面有些会变成英文,虽然没什么影响,不过强迫症会不舒服(比如我)
![现象](https://static.zahui.fan/images/3356113696516.png)

这种情况是由于文件夹内没有`desktop.ini`导致的,或者`desktop.ini`权限不正确
> desktop.ini 文件是一个隐藏文件

## windows10的desktop.ini文件内容

下载:

```ini
[.ShellClassInfo]
LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-21798
IconResource=%SystemRoot%\system32\imageres.dll,-184
```

桌面:

```ini
[.ShellClassInfo]
LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-21769
IconResource=%SystemRoot%\system32\imageres.dll,-183
[{E8A54E83-A4A0-4C7F-B391-DF76B9DB9690}]
AppID={1EC9B-E1972AA-E5401EC-9BE1-932A-EE540}
```

文档:

```ini
[.ShellClassInfo]
LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-21770
IconResource=%SystemRoot%\system32\imageres.dll,-112
IconFile=%SystemRoot%\system32\shell32.dll
IconIndex=-235
```

图片:

```ini
[.ShellClassInfo]
LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-21779
InfoTip=@%SystemRoot%\system32\shell32.dll,-12688
IconResource=%SystemRoot%\system32\imageres.dll,-113
IconFile=%SystemRoot%\system32\shell32.dll
IconIndex=-236
```

视频:

```ini
[.ShellClassInfo]
LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-21779
InfoTip=@%SystemRoot%\system32\shell32.dll,-12688
IconResource=%SystemRoot%\system32\imageres.dll,-113
IconFile=%SystemRoot%\system32\shell32.dll
IconIndex=-236
```

音乐:

```ini
[.ShellClassInfo]
LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-21790
InfoTip=@%SystemRoot%\system32\shell32.dll,-12689
IconResource=%SystemRoot%\system32\imageres.dll,-108
IconFile=%SystemRoot%\system32\shell32.dll
IconIndex=-237
```

3D对象:

```ini
[.ShellClassInfo]
LocalizedResourceName=@%SystemRoot%\system32\windows.storage.dll,-21825
IconResource=%SystemRoot%\system32\imageres.dll,-198
```

## 重新授权

```bat
attrib +R "%UserProFile%\3D Objects"
attrib +R "%UserProFile%\Videos"
attrib +R "%UserProFile%\Pictures"
attrib +R "%UserProFile%\Documents"
attrib +R "%UserProFile%\Downloads"
attrib +R "%UserProFile%\Music"
attrib +R "%UserProFile%\Desktop"
```
