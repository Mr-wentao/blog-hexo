---
title: 快速安装 node exporter
categories:
  - 监控
tags:
  - prometheus
  - 监控
  - 配置记录
  - node_exporter
abbrlink: ln38vw8d
date: 2023-09-28 22:02:43
---

复制粘贴就能用，适用于虚拟机安装， k8s环境看这个， 更方便[Kubernetes中使用Prometheus对集群节点做监控](/posts/61baae6f/)

```bash
[ -d /data/src ] || mkdir -p /data/src
cd /data/src/
[ -f /data/src/node_exporter ] || wget https://file.babudiu.com/f/2Bf8/node_exporter-1.6.1.linux-amd64.tar.gz
tar xf node_exporter-1.6.1.linux-amd64.tar.gz
/bin/cp node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/ && rm -rf /data/src/node_exporter-1.6.1.linux-amd64

cat >/etc/systemd/system/node_exporter.service <<EOF
[Unit]
Description=node_exporter
Documentation=https://prometheus.io/
After=network.target
[Service]
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=on-failure
[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now node_exporter

```