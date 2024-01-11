---
title: bat命令修改windows环境变量
categories:
  - Windows
tags:
  - cmd
  - bat
  - Script
  - 脚本
abbrlink: lqgfuqik
date: 2023-12-22 17:37:53
---
在bat下修改环境变量有几种方式, 比如 `set` `setx` `vmic ENVIRONMENT`


## set

windows 的set 和 bash 里面直接赋值类似, 只在当前脚本中生效, 比如

```bat
set a=b

echo %a%
b
```

## setx

setx和set类似, 不一样的是setx会把设置持久化保存起来

```bat
setx a c
```

因为setx直接将环境变量保存在注册表中, 所以cmd终端需要关闭重新打开才能生效
```bat
echo %a%
c
```
后续就算重启电脑, 也会生效, 不过数据量比较大的时候会报错： `WARNING: The data being saved is truncated to 1024 characters`， 最终修改的内容也是不完整的。所以不建议使用

## vmic


### wmic常用命令

```bat
# 创建系统变量
wmic ENVIRONMENT create name="PPTV_HOME",username="<system>",VariableValue="%home%"

# 创建用户变量(替换一下计算机名和用户名)
wmic ENVIRONMENT create name="PPTV_HOME",username="计算机名\\用户名",VariableValue="%home%"

# 查看环境变量
wmic environment where "name='Path'" get UserName,VariableValue

# 删除环境变量
wmic ENVIRONMENT where "name='PPTV_HOME'" delete
```



### 举个例子

```bat
REM 设置一下需要添加环境变量的目录
SET DestFile="%USERPROFILE%\bin"

REM 增加bin环境变量
set path | findstr "%DestFile%" >nul && (
    echo 环境变量已存在
) || (
    echo 环境变量不存在
    wmic ENVIRONMENT where "name='Path' and username='%USERDOMAIN%\\%USERNAME%'" set VariableValue="%Path%;%DestFile%"
)
```


## 注册表方式

### 当前用户环境变量

```reg
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Environment]
"a"="b"
```

### 系统环境变量

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment]
"c"="d"
```