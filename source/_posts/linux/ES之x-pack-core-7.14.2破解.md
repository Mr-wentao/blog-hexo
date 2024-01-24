---
title: ES之x-pack-core-7.14.2破解
categories:
  - devops
abbrlink: e544f05a
date: 2024-01-02 11:58:06
---


## **ES之x-pack-core-7.14.2破解**

### **X-Pack是什么**

```
X-pack是elasticsearch的一个扩展包，将安全，警告，监视，图形和报告功能捆绑在一个易于安装的软件包中，虽然x-pack被设计为一个无缝的工作，但是你可以轻松的启用或者关闭一些功能。
```
### 破解步骤

```
主要分一下步骤
1、修改x-pack-core-7.14.2.jar
拷贝ES目录下 ./modules/x-pack-core/x-pack-core-7.14.2.jar 文件并解压
解压之后找到一下两个文件
x-pack-core-7.14.2.jar/org/elasticsearch/license/LicenseVerifier.class
x-pack-core-7.14.2.jar/org/elasticsearch/xpack/core/XPackBuild.class
用以下两个java文件重新编译之后替换
```
LicenseVerifier.java
```java
package org.elasticsearch.license;

/**
 *  * Responsible for verifying signed licenses
 *   */
public class LicenseVerifier {

    /**
 *      * verifies the license content with the signature using the packaged
 *           * public key
 *                * @param license to verify
 *                     * @return true if valid, false otherwise
 *                          */
    public static boolean verifyLicense(final License license, byte[] publicKeyData) {
        return true;
    }

    public static boolean verifyLicense(final License license) {
        return true;
    }
}

```
XPackBuild.java
``` java
package org.elasticsearch.xpack.core;
import org.elasticsearch.common.SuppressForbidden;
import org.elasticsearch.common.io.PathUtils;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.jar.JarInputStream;
import java.util.jar.Manifest;

public class XPackBuild {

    public static final XPackBuild CURRENT;

    static {
        CURRENT = new XPackBuild("Unknown", "Unknown");
    }

    /**
 *      * Returns path to xpack codebase path
 *           */
    @SuppressForbidden(reason = "looks up path of xpack.jar directly")
    static Path getElasticsearchCodebase() {
        URL url = XPackBuild.class.getProtectionDomain().getCodeSource().getLocation();
        try {
            return PathUtils.get(url.toURI());
        } catch (URISyntaxException bogus) {
            throw new RuntimeException(bogus);
        }
    }

    private String shortHash;
    private String date;

    XPackBuild(String shortHash, String date) {
        this.shortHash = shortHash;
        this.date = date;
    }

    public String shortHash() {
        return shortHash;
    }

    public String date() {
        return date;
    }
}

```
拷贝以上两个java文件到es主目录  
进入es主目录执行
```shell
javac -cp lib/elasticsearch-7.14.2.jar:modules/x-pack-core/x-pack-core-7.14.2.jar LicenseVerifier.java
javac -cp lib/elasticsearch-7.14.2.jar:lib/lucene-core-8.9.0.jar:modules/x-pack-core/x-pack-core-7.14.2.jar:lib/elasticsearch-core-7.14.2.jar XPackBuild.java


会生成两个新的class文件
LicenseVerifier.class
XPackBuild.class
分别替换
x-pack-core-7.14.2.jar/org/elasticsearch/license/LicenseVerifier.class
x-pack-core-7.14.2.jar/org/elasticsearch/xpack/core/XPackBuild.class

重新压缩成jar包x-pack-core-7.14.2.jar  
替换./modules/x-pack-core/x-pack-core-7.14.2.jar  
重启ES

```
### 替换license

去官网(https://license.elastic.co/registration)申请license后，下载下来是个JSON文件
主要替换两处 type 修改为 platinum （白金版）
expiry_date_in_millis 修改时间长一点2524579200999
```
{
    "license": {
        "uid": "f2f4a18c-f841-4b42-a2f6-26dfc577009e",
        "type": "platinum",
        "issue_date_in_millis": 1700697600000,
        "expiry_date_in_millis": 2524579200999,
        "max_nodes": 100,
        "issued_to": "hong hong (llll)",
        "issuer": "Web Form",
        "signature": "AAAAAwAAAA04M57PMmbvGO2JqgcvAAABmC9ZN0hjZDBGYnVyRXpCOW5Bb3FjZDAxOWpSbTVoMVZwUzRxVk1PSmkxaktJRVl5MUYvUWh3bHZVUTllbXNPbzBUemtnbWpBbmlWRmRZb25KNFlBR2x0TXc2K2p1Y1VtMG1UQU9TRGZVSGRwaEJGUjE3bXd3LzRqZ05iLzRteWFNekdxRGpIYlFwYkJiNUs0U1hTVlJKNVlXekMrSlVUdFIvV0FNeWdOYnlESDc3MWhlY3hSQmdKSjJ2ZTcvYlBFOHhPQlV3ZHdDQ0tHcG5uOElCaDJ4K1hob29xSG85N0kvTWV3THhlQk9NL01VMFRjNDZpZEVXeUtUMXIyMlIveFpJUkk2WUdveEZaME9XWitGUi9WNTZVQW1FMG1DenhZU0ZmeXlZakVEMjZFT2NvOWxpZGlqVmlHNC8rWVVUYzMwRGVySHpIdURzKzFiRDl4TmM1TUp2VTBOUlJZUlAyV0ZVL2kvVk10L0NsbXNFYVZwT3NSU082dFNNa2prQ0ZsclZ4NTltbU1CVE5lR09Bck93V2J1Y3c9PQAAAQAe9HG7AXDouL+RzcOpe1fcZxHPjlZ6NIGW+PZEHoabSfuUqVi/ItOL/zTX8BVriCe1NVxNyp6LuYh0Vt4gyZGUITQuWGCFMfT1c+IFLvuj3PKFvAs4biVs39vO5lWOpbpWSUbt4LBPm3GmrzMJuTYFbGc61gzOBpIqEoTOYMxz4JrVyuN65yZSy+0sH6xibLfYS+2xJ8llHbB/X6qt7UCaT+DHs1uqqWsAv3lwBUtVb/vd7ClppOIp34eV05wdQqvAFhByqjLQbXahlY+DWds+SP20lt2JG+351L/mZ1EaEsEAtYrdfOLeKdGUzoohRM4aHz6uD9IsotGbGgRr3Nvg",
        "start_date_in_millis": 1700697600000
    }
}

```
修改完之后在kibana页面上传新的许可证
或者通过命令行之后
```shell
$ curl -u elastic:密码 -XPUT 'https://127.0.0.1:9200/_xpack/license' -H "Content-Type: application/json" -d @license.json

返回 {“acknowledged”:true,“license_status”:“valid”} 就表示更改许可证成功 。

```