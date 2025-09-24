---
title: ArchLinux安装记录
categories:
  - 工具
tags:
  - ArchLinux
  - 配置记录
abbrlink: 5a1b6f71
cover: 'https://s3.babudiu.com/iuxt//images/202301302348626.png'
date: 2023-01-25 20:50:35
---

官方文档 [ArchWiki](https://wiki.archlinuxcn.org/wiki/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97) 已经写的很好了，但是每次安装的时候都要踩坑，所以开个文章记录一下。

## 磁盘分区与格式化

```bash
parted /dev/sda mklabel gpt mkpart ESP fat32 1M 513M set 1 boot on mkpart primary ext4 513M 100% print
mkfs.fat -F 32 /dev/sda1
mkfs.ext4 /dev/sda2
```

## 挂载与chroot操作

chroot后相当于进入了安装后的系统内进行操作

```bash
mount /dev/sda2 /mnt
mount --mkdir /dev/sda1 /mnt/boot
pacstrap -K /mnt base linux linux-firmware
genfstab -U /mnt >> /mnt/etc/fstab

arch-chroot /mnt
```

## 常用配置

### 配置时区

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
```

### 配置locale

```bash
pacman -S vim vi
```

```bash
sed -e 's/#en_US.UTF-8/en_US.UTF-8/' \
    -e 's/#zh_CN.UTF-8/zh_CN.UTF-8/' \
    -i /etc/locale.gen
```

```bash
locale-gen
echo "LANG=en_US.UTF-8" >> /etc/locale.conf
echo arch >> /etc/hostname
```

### 配置网络

这里使用的是systemd全家桶

vim /etc/systemd/network/20-wired.network

```conf
[Match]
Name=ens33

[Network]
DHCP=ipv4
```

```bash
systemctl enable systemd-networkd systemd-resolved
```

### 修改root密码

```bash
passwd root
```

### 创建普通用户

```bash
pacman -S sudo
groupadd sudo
useradd -s /bin/bash -m iuxt
usermod  -aG sudo iuxt
echo "iuxt ALL=(ALL:ALL) NOPASSWD: ALL" > /etc/sudoers.d/iuxt
passwd iuxt
```

## 安装grub

```bash
pacman -S efibootmgr grub
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg
```

## 安装常用工具

```bash
pacman -S openssh
systemctl enable sshd
```

## 完成安装

```bash
exit
umount -R /mnt
reboot
```

到此为止，不带图形界面的ArchLinux已经安装好了。

## ArchInstall

基本系统安装, 也可以使用archinstall, 这个是在虚拟机环境下, 我的安装配置.

![](https://s3.babudiu.com/iuxt//images/202307300923540.png)

## 图形界面

{% tabs TabName %}
<!-- tab 使用i3-wm -->

安装

```bash
sudo pacman -S xorg xorg-xinit
sudo pacman -S i3 dmenu
sudo pacman -S ttf-droid wqy-microhei wqy-zenhei noto-fonts-emoji ttf-font-awesome
sudo pacman -S alacritty
```

设置 archlinux 为文本模式启动

```bash
sudo systemctl set-default multi-user.target
```

在 ~/.xinitrc 中添加以下内容运行 i3

```bash
exec dbus-launch i3
```

配置 ~/.bash_profile 中添加以下内容运行 startx

```bash
if [ -z "$DISPLAY" ] && [ -n "$XDG_VTNR" ] && [ "$XDG_VTNR" -eq 1 ]; then
  exec startx
fi
```

<!-- endtab -->


<!-- tab 使用KDE -->

```bash
pacman -S xorg-server xorg-drivers xorg-xinit
pacman -S sddm
systemctl enable --now sddm.service
pacman -S plasma konsole dolphin kwalletmanager

# 为了支持kde的应用商店
sudo pacman -S archlinux-appstream-data  packagekit-qt5  flatpak fwupd
```

<!-- endtab -->
{% endtabs %}

## 使用aur

### 安装yay

```bash
sudo pacman -S base-devel git
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```


## 配置中文

### 中文字体

```bash
sudo pacman -Sy wqy-zenhei wqy-microhei \
    noto-fonts-emoji ttf-dejavu \
    adobe-source-han-sans-cn-fonts \
    adobe-source-han-sans-tw-fonts \
    adobe-source-han-sans-jp-fonts \
    adobe-source-han-sans-kr-fonts \
    ttf-sarasa-gothic
```

### 中文输入法
```bash
sudo pacman -Sy fcitx5-im fcitx5-qt fcitx5-gtk
# fcitx5-im是一个包组，包括fcitx5、fcitx5-configtool、fcitx5-gtk、fcitx5-qt
yay fcitx5-input-support
```

## 虚拟机配置

```bash
pacman -S gtkmm3
pacman -S open-vm-tools
pacman -S xf86-video-vmware
systemctl enable --now vmtoolsd vmware-vmblock-fuse
```

## 配置zsh

安装zsh

```bash
sudo pacman -S zsh
```

安装 oh my zsh 官网 <https://github.com/ohmyzsh/ohmyzsh>

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

```

安装 powerlevel10k 主题

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
sed -i 's#^ZSH_THEME=.*#ZSH_THEME="powerlevel10k/powerlevel10k"#g' ~/.zshrc

# 安装nerd font字体
yay -S ttf-meslo-nerd-font-powerlevel10k
```

安装常用插件

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
zsh -ic "omz plugin enable zsh-autosuggestions"


git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
zsh -ic "omz plugin enable zsh-syntax-highlighting"

sudo pacman -S fzf
zsh -ic "omz plugin enable fzf"

# 启用一些自带插件
zsh -ic "omz plugin enable sudo z git"

```