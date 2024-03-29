---
title: Python读写文件
categories:
  - 开发
tags:
  - Python
  - 文件
abbrlink: fe29bf0b
cover: 'https://static.zahui.fan/images/202307020714544.svg'
date: 2022-12-28 21:24:25
---

使用Python读写文件很方便，有多种方法，但是读写大文件还是需要优化的。

python open文件的模式：

| 模式 | 描述                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| r    | 以只读方式打开文件。文件的指针将会放在文件的开头。这是默认模式。                                                                                                   |
| rb   | 以二进制格式打开一个文件用于只读。文件指针将会放在文件的开头。这是默认模式。                                                                                       |
| r+   | 打开一个文件用于读写。文件指针将会放在文件的开头。                                                                                                                 |
| rb+  | 以二进制格式打开一个文件用于读写。文件指针将会放在文件的开头。                                                                                                     |
| w    | 打开一个文件只用于写入。如果该文件已存在则将其覆盖。如果该文件不存在，创建新文件。                                                                                 |
| wb   | 以二进制格式打开一个文件只用于写入。如果该文件已存在则将其覆盖。如果该文件不存在，创建新文件。                                                                     |
| w+   | 打开一个文件用于读写。如果该文件已存在则将其覆盖。如果该文件不存在，创建新文件。                                                                                   |
| wb+  | 以二进制格式打开一个文件用于读写。如果该文件已存在则将其覆盖。如果该文件不存在，创建新文件。                                                                       |
| a    | 打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。也就是说，新的内容将会被写入到已有内容之后。如果该文件不存在，创建新文件进行写入。             |
| ab   | 以二进制格式打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。也就是说，新的内容将会被写入到已有内容之后。如果该文件不存在，创建新文件进行写入。 |
| a+   | 打开一个文件用于读写。如果该文件已存在，文件指针将会放在文件的结尾。文件打开时会是追加模式。如果该文件不存在，创建新文件用于读写。                                 |
| ab+  | 以二进制格式打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。如果该文件不存在，创建新文件用于读写。                                             |

## 读取小文件

> 小文件读取可以用`readlines()`, 返回一个列表

```python
with open("test.txt", 'r') as f:
    print(f.readlines())
```

以上代码执行的结果(换行符用\n表示):

```bash
['111\n', '222\n', '333\n']
```

## 按行读取超大文件

文件如果比较大，就不能使用`readlines()`来读取了，那样会占用大量内存。可以使用遍历`readline()`方法来实现

```python
with open("test.txt", 'r') as f:
    while True:
        line = f.readline()
        if line:
            print(line, end="")
        else:
            break
```

## 写入大文件

写入大文件一般都是追加写入

```python
with open('test.txt', 'a') as f:
    while True:
        f.write('Hello, world!')
```
