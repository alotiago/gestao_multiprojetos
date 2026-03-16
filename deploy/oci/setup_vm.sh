#!/usr/bin/env bash
set -euo pipefail

if ! command -v apt-get >/dev/null 2>&1; then
  echo "Este script foi feito para Ubuntu/Debian (apt-get)."
  exit 1
fi

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw docker.io docker-compose-v2 nginx certbot python3-certbot-nginx

sudo systemctl enable --now docker
sudo systemctl enable --now nginx

if ! getent group docker >/dev/null; then
  sudo groupadd docker
fi

sudo usermod -aG docker "$USER"

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "Setup da VM concluído."
echo "Saia e entre novamente na sessão para aplicar o grupo docker."
