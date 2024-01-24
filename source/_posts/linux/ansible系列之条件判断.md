---
title: Ansible系列之条件判断
abbrlink: a361f259
categories:
  - devops
tags:
  - Ansible
date: 2022-02-16 11:45:19
---

在ansible中，使用when关键字来做条件判断，when关键字即为当条件成功就执行此条任务。在when判断中不需要加`{{}}`

## 字符串判断

| 判断符 | 说明                                             |
| ------ | ------------------------------------------------ |
| ==     | 判断字符串是否相同，相同为真，不同为假           |
| lower  | 是否全是小写，是为真，不是为假                   |
| upper  | 是否是纯大写，是为真，不是为假                   |
| in     | 判断字符串是否在另一个字符串中，是为真，不是为假 |

### 判断系统,不支持的系统直接报错退出

> ansible_distribution是ansible自带变量，查看变量可以用`ansible localhost -m setup`命令。

```yml
---
- hosts: all
    tasks:
    - fail: msg="this playbook don't support CentOS"
      when: ansible_distribution == "CentOS"
```

### 判断字符串大小写

```yml
---
- hosts: all
  vars:
    str1: "abc"
    str2: "ABC"
  tasks:
  - debug:
      msg: "This string is all lowercase"
    when: str1 is lower
  - debug:
      msg: "This string is all uppercase"
    when: str2 is upper
```

### 判断字符串的包含关系

```yml
---
tasks:
- name: check wsl
    fail: msg="this playbook don't support wsl"
    when: 'WSL' in ansible_kernel
```

## 运算符判断

在 ansible 中，我们可以使用如下比较运算符：

| 比较运算符 | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| ==         | 比较两个对象是否相等，相等为真                               |
| !=         | 比较两个对象是否不等，不等为真                               |
| >          | 比较两个值的大小，如果左边的值大于右边的值，则为真           |
| <          | 比较两个值的大小，如果左边的值小于右边的值，则为真           |
| >=         | 比较两个值的大小，如果左边的值大于右边的值或左右相等，则为真 |
| <=         | 比较两个值的大小，如果左边的值小于右边的值或左右相等，则为真 |

我们总结的这些运算符其实都是 jinja2 的运算符，ansible 使用 jinja2 模板引擎，在 ansible 中也可以直接使用 jinja2 的这些运算符。

说完了比较运算符，再来说说逻辑运算符，可用的逻辑运算符如下

| 逻辑运算符 | 说明                                               |
| ---------- | -------------------------------------------------- |
| and        | 逻辑与，当左边与右边同时为真，则返回真             |
| or         | 逻辑或，当左边与右边有任意一个为真，则返回真       |
| not        | 取反，对一个操作体取反                             |
| ( )        | 组合，将一组操作体包装在一起，形成一个较大的操作体 |

例 1：输出大于 2 的数字。

```yml
---
- hosts: all
  gather_facts: no
  tasks:
  - debug:
      var: item
    when: item > 2
    with_items: [ 1, 2, 3 ]
```

例 2：判断客户机系统是否是 CentOS 7。

```yml
---
- hosts: all
  tasks:
  - debug:
      msg: "System release is centos7"
    when: ansible_distribution == "CentOS" and ansible_distribution_major_version == "7"
```

> 这里的 when 条件也可写为如下：
>
>   ```yml
>   when:
>    - ansible_distribution == "CentOS"
>    - ansible_distribution_major_version == "7"
>  ```
>
> 其含义为列表中每一项结果都为 true 时才执行。

例 3：判断任务是否成功执行。

```yml
---
- hosts: localhost
  gather_facts: no
  tasks:
  - name: check folder exists
    shell: "ls /test_folder"
    register: check_test_folder
    ignore_errors: true
  - debug:
      msg: "Command execution successful"
    when: check_test_folder.rc == 0
  - debug:
      msg: "Command execution failed"
    when: check_test_folder.rc != 0
```

例 4：判断系统是Ubuntu或LinuxMint且不是虚拟机

```yml
---
- name: install gui tools on ubuntu
  apt: 
    name: ["copyq", "flameshot"]
    state: latest
    update_cache: no
  become: yes
  when:
    ( ansible_distribution == "Ubuntu" or ansible_distribution == "Linux Mint" )
    and
    ( ansible_virtualization_role != "guest" )
```

## 文件判断

### 判断Ansible控制主机的文件

ansible 可通过如下关键字对文件状态进行判断：

| 判断操作  | 说明                                                     |
| --------- | -------------------------------------------------------- |
| file      | 判断路径是否是一个文件，如果路径是一个文件则返回真；     |
| directory | 判断路径是否是一个目录，如果路径是一个目录则返回真；     |
| link      | 判断路径是否是一个软链接，如果路径是一个软链接则返回真； |
| mount     | 判断路径是否是一个挂载点，如果路径是一个挂载点则返回真； |
| exists    | 判断路径是否存在，如果路径存在则返回真；                 |

例：判断 /test_folder 是否存在。
> 这里判断的路径是ansible控制主机的路径

```yml
---
- hosts: all
  gather_facts: no
  vars:
    testpath: /test_folder
  tasks:
  - debug:
      msg: "file exists"
    when: testpath is exists
  # 下面判断表示 testpath 路径是否不存在
  # when: testpath is not exists
```

### 判断被控机器的文件状态

```yml
- name: get file stat for gpg key
  stat: path=/usr/share/keyrings/docker-archive-keyring.gpg
  register: vscode_gpg_key

# 判断远程文件是否存在
- name: add gpg key
  shell:
    cmd: curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  become: yes
  when: not vscode_gpg_key.stat.exists
```

## 变量判断

ansible 可通过如下几个关键字对变量进行判断：

|          |                                                                  |
| -------- | ---------------------------------------------------------------- |
| string   | 判断对象是否是一个字符串，是字符串则返回真；                     |
| number   | 判断对象是否是一个数字，是数字则返回真；                         |
| defined  | 判断变量是否已经定义，已经定义则返回真；                         |
| undefind | 判断变量是否已经定义，未定义则返回真；                           |
| none     | 判断变量值是否为空，如果变量已经定义，但是变量值为空，则返回真； |

例 1：当对应的条件为真时，你可以看到 debug 模块对应的输出。

```yml
---
- hosts: all
  gather_facts: no
  vars:
    defined_var: "test"
    none_var:
  tasks:
  - debug:
      msg: "Variable is defined"
    when: defined_var is defined
  - debug:
      msg: "Variable is undefined"
    when: undefined_var is undefined
  - debug:
      msg: "The variable is defined, but there is no value"
    when: none_var is none
```

例 2：判断给定变量是一个字符串还是数字。

```yml
---
- hosts: all
  gather_facts: no
  vars:
    testvar: "a"
  tasks:
  - debug:
      msg: "{{testvar}} is a number"
    when: testvar is number
  - debug:
      msg: "{{testvar}} is a string"
    when: testvar is string
```

## 结果判断

ansible 可通过如下几个关键字来对任务的执行结果进行判断：

|                      |                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------- |
| success 或 succeeded | 通过任务的返回信息判断任务的执行状态，任务执行成功则返回真                         |
| failure 或 failed    | 通过任务的返回信息判断任务的执行状态，任务执行失败则返回真                         |
| change 或 changed    | 通过任务的返回信息判断任务的执行状态，任务执行状态为 changed 则返回真              |
| skip 或 skipped      | 通过任务的返回信息判断任务的执行状态，当任务没有满足条件，而被跳过执行时，则返回真 |

例：根据任务执行结果输出对应信息。

```yml
---
- hosts: all
  gather_facts: no
  vars:
    doshell: "yes"
  tasks:
  - shell: "cat /test_folder/test_file"
    when: doshell == "yes"
    register: returnmsg
    ignore_errors: true
  - debug:
      msg: "success"
    when: returnmsg is success
  - debug:
      msg: "failed"
    when: returnmsg is failure
  - debug:
      msg: "changed"
    when: returnmsg is change
  - debug:
      msg: "skip"
    when: returnmsg is skip
```

## 整除判断

ansible 可通过如下关键字对一个数字进行整除判断：

|                  |                                                                   |
| ---------------- | ----------------------------------------------------------------- |
| even             | 判断数值是否是偶数，是偶数则返回真                                |
| odd              | 判断数值是否是奇数，是奇数则返回真                                |
| divisibleby(num) | 判断是否可以整除指定的数值，如果除以指定的值以后余数为0，则返回真 |

看如下示例：

```yml
---
- hosts: localhost
  gather_facts: no
  vars:
    num1: 2
    num2: 3
    num3: 8
  tasks:
  - debug:
      msg: "{{ num1 }} is an even number"
    when: num1 is even
  - debug:
      msg: "{{ num2 }} is an odd number"
    when: num2 is odd
  - debug:
      msg: "{{ num3 }} can be divided exactly by 4"
    when: num3 is divisibleby(4)
```

## 列表父子集判断

ansible 可使用如下关键字对列表进行父子集判断：
| 父子集判断 | 说明                                                                 |
| ---------- | -------------------------------------------------------------------- |
| subset     | 判断一个 list 是不是另一个 list 的子集，是另一个 list 的子集时返回真 |
| superset   | 判断一个 list 是不是另一个 list 的父集，是另一个 list 的父集时返回真 |

看如下示例：

```yml
---
- hosts: localhost
  gather_facts: no
  vars:
    a:
    - 2
    - 5
    b: [1,2,3,4,5]
  tasks:
  - debug:
      msg: "A is a subset of B"
    when: a is subset(b)
  - debug:
      msg: "B is the parent set of A"
    when: b is superset(a)
```

## 版本判断

在 ansible 中 version 关键字可以用于对比两个版本号的大小，或者与指定的版本号进行对比，使用语法为 version('版本号', '比较操作符')。

version 支持的比较操作符如下：

| 比较操作符 | 符号表示 | 字母表示 |
| ---------- | -------- | -------- |
| 大于       | >        | gt       |
| 大于等于   | >=       | ge       |
| 小于       | <        | lt       |
| 小于等于   | <=       | le       |
| 等于       | == 或 =  | eq       |
| 不等于     | != 或 <> | ne       |

看如下示例：

```yml
---
- hosts: localhost
  vars:
    ver1: 18.04
    ver2: 22.04
  tasks:
  - debug:
      msg: "This message can be displayed when the ver2 is greater than ver1"
    when: ver2 is version(ver1,">")
  - debug:
      msg: "system version {{ansible_distribution_version}} greater than 18.04"
    when: ansible_distribution_version is version("18.04","gt")
```

## 合并判断

在 ansible 中，可以使用 block 关键字将多个任务整合成一个块，这个块将被当做一个整体，我们可以对这个块添加判断条件，当条件成立时，则执行这个块中的所有任务。

我们来看一个小示例，如下：

```yml
---
- hosts: localhost
  gather_facts: no
  tasks:
  - debug:
      msg: "task1"
  - block:
    - debug:
        msg: "task2"
    - debug:
        msg: "task3"
    when: 2 > 1
```

## 状态判断

failed_when 的作用就是，当对应的条件成立时，将对应任务的执行状态设置为失败，我们可以借助 failed_when 关键字来完成类似 fail 模块的功能。

看下面示例：

```yml
---
- hosts: localhost
  gather_facts: no
  tasks:
  - debug:
      msg: "I execute normally"
  - shell: "echo 'This is a string for testing error'"
    register: return_value
    failed_when: ' "error" in return_value.stdout'
  - debug:
      msg: "I never execute,Because the playbook has stopped"
```

上例中，failed_when 对应的条件是 "error" in return_value.stdout，表示 error 字符串如果存在于 shell 模块执行后的标准输出中，则条件成立，当条件成立后，shell 模块的执行状态将会被设置为失败，由于 shell 模块的执行状态被设置为失败，所以 playbook 会终止运行，于是，最后的 debug 模块并不会被执行。

理解了' failed_when'关键字以后，顺势理解'changed_when'关键字就容易多了。

| 状态判断     | 说明                                                             |
| ------------ | ---------------------------------------------------------------- |
| failed_when  | 关键字的作用是在条件成立时，将对应任务的执行状态设置为失败。     |
| changed_when | 关键字的作用是在条件成立时，将对应任务的执行状态设置为 changed。 |

```yml
---
- hosts: localhost
  gather_facts: no
  tasks:
  - debug:
      msg: "test message"
    changed_when: 2 > 1
```

debug 模块在正常执行的情况下只能是 ok 状态，上例中，我们使用 changed_when 关键字将 debug 模块的执行后的状态定义为了 changed，你可以尝试执行上例 playbook，执行效果如下：

```text
$ ansible-playbook test.yml 

PLAY [localhost] **********************************************************************************************************************

TASK [debug] **************************************************************************************************************************
changed: [localhost] => {
    "msg": "test message"
}

PLAY RECAP ****************************************************************************************************************************
localhost                  : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0  
```

> 在Ansible中只有任务作出了实际的操作时（执行后状态为 changed），才会真正的执行对应的handlers，这样我们可以控制当前任务的状态。

其实，changed_when 除了能够在条件成立时将任务的执行状态设置为 changed，还能让对应的任务永远不能是 changed 状态，示例如下：

```yml
---
- hosts: B
  gather_facts: no
  tasks:
  - shell: "ls /opt"
    changed_when: false
```

当将 changed_when 直接设置为 false 时，对应任务的状态将不会被设置为 changed，如果任务原本的执行状态为 changed，最终则会被设置为 ok，所以，上例 playbook 执行后，shell 模块的执行状态最终为 ok。
