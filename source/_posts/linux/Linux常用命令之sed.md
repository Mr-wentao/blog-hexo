---
title: Linux常用命令之sed
abbrlink: 83cbdb25
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Linux
  - Command
date: 2021-02-20 14:59:24
---

## 参数说明

> -e  < script >或--expression=< script > 以选项中指定的script来处理输入的文本文件。  
-f  <script文件>或--file=<script文件> 以选项中指定的script文件来处理输入的文本文件。  
-h  或--help 显示帮助。  
-n  或--quiet或--silent 仅显示script处理后的结果。  
-V  或--version 显示版本信息。  
-i  直接修改文件内容  

## 动作说明

> a ：新增， a 的后面可以接字串，而这些字串会在新的一行出现(目前的下一行)～  
c ：取代， c 的后面可以接字串，这些字串可以取代 n1,n2 之间的行！  
d ：删除，因为是删除啊，所以 d 后面通常不接任何咚咚；  
i ：插入， i 的后面可以接字串，而这些字串会在新的一行出现(目前的上一行)；  
p ：打印，亦即将某个选择的数据印出。通常 p 会与参数 sed -n 一起运行～  
s ：取代，可以直接进行取代的工作哩！通常这个 s 的动作可以搭配正规表示法！例如 1,20s/old/new/g 就是啦！  

## 一些例子

### 打印两个字符之间的所有行

```bash
sed -n '/-----BEGIN RSA PRIVATE KEY-----/,/-----END RSA PRIVATE KEY-----/p' ~/.ssh/id_rsa
```

### 在指定位置插入行

| 说明                                           | 命令                                |
| ---------------------------------------------- | ----------------------------------- |
| 在第二行后面插入，也就是xxxx在第三行           | sed '2a xxxx' a.txt                 |
| 在第二行前面插入，也就是xxxx在第二行           | sed '2i xxxx' a.txt                 |
| 在第二和第四行后面插入，也就是xxxx在第3和第5行 | sed '2,4a xxxx' a.txt               |
| 跟上面有所不同，xxxx在第3行和第6行             | sed -e '2a xxxx' -e '4a xxxx' a.txt |
| 行首添加一行，xxxx在第一行                     | sed '1i xxxx' a.txt                 |
| 行尾添加一行，xxxx在最后一行                   | sed '$a xxxx' a.txt                 |
| 在奇数行后添加一行                             | sed '1~2a xxxx' a.txt               |
| 在偶数行后添加一行                             | sed '2~2a xxxx' a.txt               |
| 在匹配到的行后添加一行                         | sed '/^hello/a xxxx' a.txt          |

### 查看400-500行的内容

```bash
sed  -n  '400,500p'  file文件名
```

> ^表示行首
  $表示行尾
  &表示一整行

### 删除一个文件中行号为奇数的行

```bash
sed '1~2'd  file
```

### 删除一个文件中指定行

```bash
# 删除第一行
sed -i '1d' filename

# 删除300和400行
sed -i '300,400'd file
```

### 在testfile文件的第四行后添加一行，并将结果输出到标准输出

```bash
sed -e 4a\newLine testfile
```

### 删除空行

```bash
sed '/^$/d'
```

### 删除指定的字符

```bash
echo "{abc}:\"" | sed 's/[{}":]//g'
```

### sed 替换 字符串

```bash
git_url=$(echo $4 | sed 's/http/https/')
```

### 将某一行加注释

```bash
sed 's/^nameserver/#&/' /etc/resolv.conf
```

### 修改配置

```bash
sed -i "s/aaa=.*/aaa=123456/g" config.ini
```

### 删除空格

```bash
echo '   12 345   ' | sed 's/ //g'
```

### 替换文件里面的内容

```bash
sed -i "s/archive.ubuntu.com/mirrors.aliyun.com/g" /etc/apt/sources.list
# 如果要替换的文本里含有/可以换成#、@
sed -i "s#security.ubuntu.com#mirrors.aliyun.com#g" /etc/apt/sources.list
```


## 多次替换文本

```bash
sed -i xxx.txt \
    -e 's/111/222/g' \
    -e 's/333/444/g'
```

将111替换成222，333替换成444
