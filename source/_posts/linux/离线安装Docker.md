---
title: 离线安装Docker
categories:
  - linux
tags:
  - Docker
abbrlink: b4ed6a46
date: 2023-05-24 14:40:05
---

离线二进制包下载地址 <https://download.docker.com/linux/static/stable/x86_64/> 

```bash
wget https://file.babudiu.com/f/B1I8/docker-24.0.1.tgz

tar xf docker-24.0.1.tgz
mv docker/* /usr/bin/
```

```bash
cat > /usr/lib/systemd/system/containerd.service << EOF
[Unit]
Description=containerd container runtime
Documentation=https://containerd.io
After=network.target local-fs.target

[Service]
ExecStartPre=-/sbin/modprobe overlay
ExecStart=/usr/local/bin/containerd

Type=notify
Delegate=yes
KillMode=process
Restart=always
RestartSec=5
LimitNPROC=infinity
LimitCORE=infinity
LimitNOFILE=infinity
TasksMax=infinity
OOMScoreAdjust=-999

[Install]
WantedBy=multi-user.target
EOF

cat > /usr/lib/systemd/system/docker.service << EOF
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network.target

[Service]
Type=notify

ExecStart=/usr/bin/dockerd -H unix:///var/run/docker.sock

ExecReload=/bin/kill -s HUP $MAINPID

LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TimeoutStartSec=0
Delegate=yes
KillMode=process

[Install]
WantedBy=multi-user.target
EOF

cat > /usr/lib/systemd/system/docker.socket << EOF
[Unit]
Description=Docker Socket for the API
PartOf=docker.service

[Socket]
ListenStream=/var/run/docker.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker

[Install]
WantedBy=sockets.target
EOF


sudo mkdir /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "1g"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl enable --now docker
```
