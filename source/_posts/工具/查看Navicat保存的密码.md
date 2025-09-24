---
title: 查看Navicat保存的密码
categories:
  - 工具
tags:
  - MySQL
  - Docker
  - PHP
abbrlink: lqoui8yg
cover: 'https://s3.babudiu.com/iuxt//images/202312281506687.png'
date: 2023-12-28 14:50:14
---
Navicat密码一旦保存, 再次编辑就没法查看密码是什么了, 包括之前可以使用的星号密码查看器也看不到密码, 我们可以通过导出链接文件, 然后通过解密被加密的密码来获取密码原文.

## 导出加密密码

打开Navicat -- 文件 -- 导出连接
![image.png](https://s3.babudiu.com/iuxt//images/202312281454479.png)

接下来的弹窗里, 勾选导出密码, 然后导出成ncx文件
![image.png](https://s3.babudiu.com/iuxt//images/202312281454290.png)

用文本编辑器打开 connections.ncx 文件, 复制 password 的值, 这个就是加密后的密码.

## 使用PHP解密

电脑没有PHP环境, 所以选择使用Docker来运行PHP, 操作如下: 

### 准备解密脚本

vim decode_navicat_password.php
```php
<?php

namespace FatSmallTools;

class NavicatPassword
{
    protected $version = 0;
    protected $aesKey = 'libcckeylibcckey';
    protected $aesIv = 'libcciv libcciv ';
    protected $blowString = '3DC5CA39';
    protected $blowKey = null;
    protected $blowIv = null;

    public function __construct($version = 12)
    {
        $this->version = $version;
        $this->blowKey = sha1('3DC5CA39', true);
        $this->blowIv = hex2bin('d9c7c3c8870d64bd');
    }

    public function encrypt($string)
    {
        $result = FALSE;
        switch ($this->version) {
            case 11:
                $result = $this->encryptEleven($string);
                break;
            case 12:
                $result = $this->encryptTwelve($string);
                break;
            default:
                break;
        }

        return $result;
    }

    protected function encryptEleven($string)
    {
        $round = intval(floor(strlen($string) / 8));
        $leftLength = strlen($string) % 8;
        $result = '';
        $currentVector = $this->blowIv;

        for ($i = 0; $i < $round; $i++) {
            $temp = $this->encryptBlock($this->xorBytes(substr($string, 8 * $i, 8), $currentVector));
            $currentVector = $this->xorBytes($currentVector, $temp);
            $result .= $temp;
        }

        if ($leftLength) {
            $currentVector = $this->encryptBlock($currentVector);
            $result .= $this->xorBytes(substr($string, 8 * $i, $leftLength), $currentVector);
        }

        return strtoupper(bin2hex($result));
    }

    protected function encryptBlock($block)
    {
        return openssl_encrypt($block, 'BF-ECB', $this->blowKey, OPENSSL_RAW_DATA|OPENSSL_NO_PADDING);
    }

    protected function decryptBlock($block)
    {
        return openssl_decrypt($block, 'BF-ECB', $this->blowKey, OPENSSL_RAW_DATA|OPENSSL_NO_PADDING);
    }

    protected function xorBytes($str1, $str2)
    {
        $result = '';
        for ($i = 0; $i < strlen($str1); $i++) {
            $result .= chr(ord($str1[$i]) ^ ord($str2[$i]));
        }

        return $result;
    }

    protected function encryptTwelve($string)
    {
        $result = openssl_encrypt($string, 'AES-128-CBC', $this->aesKey, OPENSSL_RAW_DATA, $this->aesIv);
        return strtoupper(bin2hex($result));
    }

    public function decrypt($string)
    {
        $result = FALSE;
        switch ($this->version) {
            case 11:
                $result = $this->decryptEleven($string);
                break;
            case 12:
                $result = $this->decryptTwelve($string);
                break;
            default:
                break;
        }

        return $result;
    }

    protected function decryptEleven($upperString)
    {
        $string = hex2bin(strtolower($upperString));

        $round = intval(floor(strlen($string) / 8));
        $leftLength = strlen($string) % 8;
        $result = '';
        $currentVector = $this->blowIv;

        for ($i = 0; $i < $round; $i++) {
            $encryptedBlock = substr($string, 8 * $i, 8);
            $temp = $this->xorBytes($this->decryptBlock($encryptedBlock), $currentVector);
            $currentVector = $this->xorBytes($currentVector, $encryptedBlock);
            $result .= $temp;
        }

        if ($leftLength) {
            $currentVector = $this->encryptBlock($currentVector);
            $result .= $this->xorBytes(substr($string, 8 * $i, $leftLength), $currentVector);
        }

        return $result;
    }

    protected function decryptTwelve($upperString)
    {
        $string = hex2bin(strtolower($upperString));
        return openssl_decrypt($string, 'AES-128-CBC', $this->aesKey, OPENSSL_RAW_DATA, $this->aesIv);
    }
}


use FatSmallTools\NavicatPassword;

// 需要指定版本，11 适用于11版本或以下.
// 12 适用于12版本和以上, 个人测试16版本可以正常解密.
$navicatPassword = new NavicatPassword(12);
//$navicatPassword = new NavicatPassword(11);

//解密, 替换成你的加密秘钥
$decode = $navicatPassword->decrypt('F0FC4E94542FF60596CC6FFA9F5F68D1');
echo $decode."\n";

```


### 使用Docker版PHP来执行脚本

执行php脚本,使用cli版本的镜像即可. 这里选择php:8.3.1-cli

```bash
docker run --rm -v $(pwd):/data php:8.3.1-cli php /data/decode_navicat_password.php
```

![image.png](https://s3.babudiu.com/iuxt//images/202312281503747.png)

密码会打印在控制台上.