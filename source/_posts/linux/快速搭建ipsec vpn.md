---
title: 快速搭建ipsec Vpn
abbrlink: 759185f9
cover: 'https://static.zahui.fan/images/202211041307268.jpg'
categories:
  - devops
tags:
  - Docker
  - 配置记录
date: 2022-10-04 21:59:04
---


## 安装Docker

```bash
curl -fsSL get.docker.com | bash
sudo usermod -aG docker $USER
```

## 启动服务

```bash
docker run \
  --name ipsec-vpn-server \
  --restart=always \
  -v $(pwd)/ikev2-vpn-data:/etc/ipsec.d \
  -p 500:500/udp \
  -p 4500:4500/udp \
  -d --privileged \
  --restart=always \
  hwdsl2/ipsec-vpn-server
```

## 将ikev2-vpn-data文件复制到本地

在ikev2-vpn-data目录中，证书或配置文件的位置：

| 操作系统         | 文件名                 | 备注                          |
| ---------------- | ---------------------- | ----------------------------- |
| Windows 和 Linux | vpnclient.p12          | Windows10 & 11按照下文配置VPN |
| Android          | vpnclient.sswan        | 安卓需要安装strongSwan软件    |
| Apple设备        | vpnclient.mobileconfig | 导入描述文件即可              |



## windows客户端配置

### 导入证书

```bash
certutil -f -importpfx vpnclient.p12 NoExport
```

> 证书会导入到 **受信任的根证书颁发机构**  **IKEv2 VPN CA**

> 另外，你也可以手动导入 .p12 文件。在导入证书后，你必须确保将客户端证书放在 "个人 -> 证书" 目录中，并且将 CA 证书放在 "受信任的根证书颁发机构 -> 证书" 目录中。

### 创建VPN连接

在 Windows 计算机上添加一个新的 IKEv2 VPN 连接。对于 Windows 8.x 和 10，推荐从命令提示符运行以下命令创建 VPN 连接，以达到更佳的安全性和性能。

```powershell
powershell -command "Add-VpnConnection -ServerAddress '这里是你的VPN服务器地址' -Name 'VPN1' -TunnelType IKEv2 -AuthenticationMethod MachineCertificate -EncryptionLevel Required -PassThru"
```

### 设置 IPsec 参数

```powershell
powershell -command "Set-VpnConnectionIPsecConfiguration -ConnectionName 'VPN1' -AuthenticationTransformConstants GCMAES128 -CipherTransformConstants GCMAES128 -EncryptionMethod AES256 -IntegrityCheckMethod SHA256 -PfsGroup None -DHGroup Group14 -PassThru -Force"
```