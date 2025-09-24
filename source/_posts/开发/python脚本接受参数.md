---
title: Python脚本接受参数
abbrlink: 6c12bda4
cover: 'https://s3.babudiu.com/iuxt//images/202211041307268.jpg'
categories:
  - 开发
tags:
  - Python
  - Script
date: 2021-07-06 16:06:33
---

完善一下python脚本，让它支持更完善的参数（长参数、短参数）

```python
import getopt, sys

def parse_args(args=sys.argv[1:]):
    try:
        opts, args = getopt.getopt(args, "hvc:w:", ["help", "short", "verbose", "critical_num=", "warning_num="])
    except getopt.GetoptError as err:
        print("Input parameter error")
        sys.exit()

    verbose = False
    short = False
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            print("""
            useage:
                -h --help          : print help
                -v --verbose       : show dmesg oom kill log
                -c --critical_num  : How many times is called a critical
                -w --warning_num   : How many times is called a warning
            """)
            sys.exit()
        elif opt in ("-c", "--critical_num"):
            critical_num = arg
        elif opt in ("-w", "--warning_num"):
            warning_num = arg
        elif opt in ("-s"):
            short = True
        elif opt in ("-v"):
            verbose = True

    return warning_num, critical_num, short, verbose

if __name__ == '__main__':
    print(parse_args())
```
