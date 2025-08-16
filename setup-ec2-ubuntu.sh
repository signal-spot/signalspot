#!/bin/bash

# SignalSpot EC2 Ubuntu 환경 설정 스크립트
# Usage: ./setup-ec2-ubuntu.sh

set -e  # 에러 발생시 스크립트 중단

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SignalSpot EC2 Ubuntu Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 시스템 업데이트
echo -e "${YELLOW}1. Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. 필수 도구 설치
echo -e "${YELLOW}2. Installing essential tools...${NC}"
sudo apt install -y curl wget git build-essential

# 3. Node.js 18.x 설치 (NodeSource 리포지토리 사용)
echo -e "${YELLOW}3. Installing Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Node 버전 확인
echo -e "${GREEN}Node.js version: $(node --version)${NC}"
echo -e "${GREEN}npm version: $(npm --version)${NC}"

# 4. PM2 설치
echo -e "${YELLOW}4. Installing PM2...${NC}"
sudo npm install -g pm2

# 5. Docker 설치
echo -e "${YELLOW}5. Installing Docker...${NC}"
# Docker 공식 GPG 키 추가
sudo apt-get install -y ca-certificates gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Docker 리포지토리 추가
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker

# 6. Docker Compose 설치
echo -e "${YELLOW}6. Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Docker Compose 버전 확인
echo -e "${GREEN}Docker Compose version: $(docker-compose --version)${NC}"

# 7. PostgreSQL 클라이언트 설치 (선택사항 - 디버깅용)
echo -e "${YELLOW}7. Installing PostgreSQL client...${NC}"
sudo apt-get install -y postgresql-client

# 8. Redis 도구 설치 (선택사항 - 디버깅용)
echo -e "${YELLOW}8. Installing Redis tools...${NC}"
sudo apt-get install -y redis-tools

# 9. Nginx 설치 (이미 설치되어 있을 수 있음)
echo -e "${YELLOW}9. Installing Nginx...${NC}"
sudo apt-get install -y nginx

# 10. Certbot 설치 (Let's Encrypt SSL)
echo -e "${YELLOW}10. Installing Certbot for SSL...${NC}"
sudo apt-get install -y certbot python3-certbot-nginx

# 11. 모니터링 도구 설치
echo -e "${YELLOW}11. Installing monitoring tools...${NC}"
sudo apt-get install -y htop iotop nethogs

# 12. 방화벽 설정 (UFW)
echo -e "${YELLOW}12. Configuring firewall...${NC}"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# 13. 스왑 메모리 설정 (메모리 부족 방지)
echo -e "${YELLOW}13. Setting up swap memory...${NC}"
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo "/swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab
fi

# 14. 시스템 리소스 제한 증가
echo -e "${YELLOW}14. Increasing system limits...${NC}"
cat << EOF | sudo tee -a /etc/security/limits.conf
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# 15. sysctl 최적화
echo -e "${YELLOW}15. Optimizing sysctl settings...${NC}"
cat << EOF | sudo tee -a /etc/sysctl.conf
# Network optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
net.ipv4.ip_local_port_range = 10000 65000

# Memory optimizations
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

sudo sysctl -p

# 16. 타임존 설정
echo -e "${YELLOW}16. Setting timezone to Asia/Seoul...${NC}"
sudo timedatectl set-timezone Asia/Seoul

# 17. 로그 로테이션 설정
echo -e "${YELLOW}17. Setting up log rotation...${NC}"
cat << EOF | sudo tee /etc/logrotate.d/signalspot
/home/ubuntu/signalspot/apps/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${YELLOW}Important next steps:${NC}"
echo "1. Log out and log back in for Docker permissions to take effect"
echo "   Or run: newgrp docker"
echo ""
echo "2. Clone the SignalSpot repository:"
echo "   git clone https://github.com/signal-spot/signalspot.git"
echo "   cd signalspot"
echo ""
echo "3. Configure environment variables:"
echo "   cd apps/backend"
echo "   cp .env.production.example .env.production"
echo "   nano .env.production"
echo ""
echo "4. Set up Firebase service account:"
echo "   Place your Firebase service account JSON file in apps/backend/"
echo ""
echo "5. Run the deployment script:"
echo "   cd ~/signalspot"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh production"
echo ""
echo "6. Configure Nginx:"
echo "   sudo cp nginx.signalspot.conf /etc/nginx/sites-available/signalspot"
echo "   sudo ln -s /etc/nginx/sites-available/signalspot /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo nginx -s reload"
echo ""
echo "7. Set up SSL certificate:"
echo "   sudo certbot --nginx -d lettie-dating.co.kr"
echo ""
echo -e "${GREEN}System information:${NC}"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1)"