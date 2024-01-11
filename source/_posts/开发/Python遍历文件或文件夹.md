---
title: Python遍历文件或文件夹
categories:
  - 开发
tags:
  - Python
abbrlink: 950d73ef
date: 2022-12-29 13:40:39
---

## 说明

root: 当前遍历到的目录, 也就是所在的目录, 字符串
dirs: 当前目录下的子目录列表
files: 当前目录下的文件列表

比如文件结构 `/tmp/1/` :
```bash
1
├── file1
├── file2
├── folder1
└── folder2
```

脚本内容:
```python
for root, dirs, files in os.walk("/tmp/1/"):
    print("root", root)
    print(dirs)
    print(files)
```

输出结果
```bash
# 当前的root是
/tmp/1/

# root下的目录列表为:
['folder2', 'folder1']

# root下的文件列表为
['file2', 'file1']

# 遍历到的下一个root, 里面的文件和目录都为空.
/tmp/1/folder2
[]
[]

# 遍历到的下一个root
/tmp/1/folder1
[]
[]
```

## 遍历所有文件夹

```python
import os
path=r"c:\users\iuxt\desktop\"

# 获取到当前目录下的所有子目录的绝对路径
for root,dirs,files in os.walk(path):
    for dir in dirs:
        print(os.path.join(root, dir))
```

## 遍历所有文件

```python
import os
path=r"C:\users\iuxt\desktop\"

# 获取到的是此目录下和子目录下所有文件的绝对路径
for root,dirs,files in os.walk(path):
    for file in files:
        print(os.path.join(root, file))
```


## 遍历到最深的文件夹

```python
path=r"/tmp/1/"

for root, dirs, files in os.walk(path):
    if len(dirs) == 0:
        print(root)
```


## 一个例子, 自动清理MySQL备份文件

```python
import os
import glob


keep_file_num = 60
clean_folder = "/data/backup/mysql/"


def delete_files(files):
    """
    files: 文件绝对路径列表
    """
    for file in files:
        os.remove(file)
        print("clean  " + file)


for root, dirs, files in os.walk(clean_folder):
    """
    root: 当前遍历到的目录, 也就是所在的目录, 字符串
    dirs: 当前目录下的子目录列表
    files: 当前目录下的文件
    """
    if len(dirs) == 0:

        # 所有文件列表,绝对路径
        files = glob.glob(os.path.join(root, '*'))

        # 按照时间排序, 时间早的在前
        files.sort(key=os.path.getmtime)

        # 除去保留的, 其余的删除
        clean_num = len(files) - keep_file_num
        if clean_num < 0:
            continue
        else:
            files = files[:clean_num]
            delete_files(files)
```