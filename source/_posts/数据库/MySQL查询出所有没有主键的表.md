---
title: MySQL查询出所有没有主键的表
categories:
  - 数据库
tags:
  - MySQL
abbrlink: lmoa36fz
date: 2023-09-18 10:39:50
---

作者：May22Night
链接：<https://www.jianshu.com/p/f484c63e5c96>

## 压缩版:
```sql
SELECT a.TABLE_SCHEMA,a.TABLE_NAME FROM (SELECT TABLE_SCHEMA,TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA NOT IN('mysql','information_schema','performance_schema','sys','sysdb')) as a LEFT JOIN (SELECT TABLE_SCHEMA,TABLE_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_TYPE='PRIMARY KEY' AND TABLE_SCHEMA NOT IN('mysql','information_schema','performance_schema','sys','sysdb')) as b ON a.TABLE_SCHEMA=b.TABLE_SCHEMA AND a.TABLE_NAME=b.TABLE_NAME WHERE b.TABLE_NAME IS NULL;
```

## 美化版:
```sql
SELECT
    a.TABLE_SCHEMA,
    a.TABLE_NAME 
FROM
    (
    SELECT
        TABLE_SCHEMA,
        TABLE_NAME 
    FROM
        information_schema.TABLES 
    WHERE
    TABLE_SCHEMA NOT IN ( 'mysql', 'information_schema', 'performance_schema', 'sys', 'sysdb' )) AS a
    LEFT JOIN (
    SELECT
        TABLE_SCHEMA,
        TABLE_NAME 
    FROM
        information_schema.TABLE_CONSTRAINTS 
    WHERE
        CONSTRAINT_TYPE = 'PRIMARY KEY' 
    AND TABLE_SCHEMA NOT IN ( 'mysql', 'information_schema', 'performance_schema', 'sys', 'sysdb' )) AS b ON a.TABLE_SCHEMA = b.TABLE_SCHEMA 
    AND a.TABLE_NAME = b.TABLE_NAME 
WHERE
    b.TABLE_NAME IS NULL;
```

## sql解释:

查询结果中`TABLE_SCHEMA`是库名，`TABLE_NAME`就是表名。
其查询原理就是`information_schema`库中存储了各个库与表的结构，在`information_schema.TABLES`表中存储了所有表，`information_schema.TABLE_CONSTRAINTS`表中存储了表相关的约束，主键就是一种约束，所以`CONSTRAINT_TYPE`字段为`PRIMARY KEY`值的就是拥有主键的表。
有了所有表的表名，还有了所有拥有主键的表，那么就简单了，以查询出的全部表为主表，左联一下，右表为空的就是没有主键的表。
SQL中排除了mysql自带的五个库，同时解决了不同名的库拥有相同名的表的情况，还有优化空间，不过我觉得不是业务SQL，没必要优化了。

