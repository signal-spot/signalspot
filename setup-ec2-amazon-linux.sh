#!/bin/bash

# SignalSpot EC2 Amazon Linux 2 환경 설정 스크립트
# Usage: ./setup-ec2-amazon-linux.sh

set -e  # 에러 발생시 스크립트 중단

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SignalSpot EC2 Amazon Linux Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 시스템 업데이트
echo -e "${YELLOW}1. Updating system packages...${NC}"
sudo yum update -y

# 2. Git 설치 (이미 설치되어 있을 수 있음)
echo -e "${YELLOW}2. Installing Git...${NC}"
sudo yum install -y git

# 3. Node.js 18.x 설치 (Amazon Linux 2용)
echo -e "${YELLOW}3. Installing Node.js 18.x...${NC}"
# NodeSource 리포지토리는 Amazon Linux를 지원하지 않으므로 nvm 사용
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# nvm 환경 변수 설정
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Node.js 18 설치
nvm install 18
nvm use 18
nvm alias default 18

# Node 버전 확인
echo -e "${GREEN}Node.js version: $(node --version)${NC}"
echo -e "${GREEN}npm version: $(npm --version)${NC}"

# 4. PM2 설치
echo -e "${YELLOW}4. Installing PM2...${NC}"
npm install -g pm2

# 5. Docker 설치 (Amazon Linux 2)
echo -e "${YELLOW}5. Installing Docker...${NC}"
sudo yum install -y docker

# Docker 서비스 시작
sudo service docker start

# 부팅시 자동 시작
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가
sudo usermod -a -G docker ec2-user

# 6. Docker Compose 설치
echo -e "${YELLOW}6. Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 심볼릭 링크 생성
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Docker Compose 버전 확인
echo -e "${GREEN}Docker Compose version: $(docker-compose --version)${NC}"

# 7. PostgreSQL 클라이언트 설치 (선택사항 - 디버깅용)
echo -e "${YELLOW}7. Installing PostgreSQL client...${NC}"
sudo yum install -y postgresql15

# 8. Redis CLI 설치 (선택사항 - 디버깅용)
echo -e "${YELLOW}8. Installing Redis CLI...${NC}"
sudo yum install -y gcc make
cd /tmp
wget http://download.redis.io/redis-stable.tar.gz
tar xzf redis-stable.tar.gz
cd redis-stable
make
sudo cp src/redis-cli /usr/local/bin/
cd ~

# 9. htop 설치 (모니터링용)
echo -e "${YELLOW}9. Installing monitoring tools...${NC}"
sudo yum install -y htop

# 10. 방화벽 설정 (필요한 포트 열기)
echo -e "${YELLOW}10. Configuring firewall...${NC}"
# Amazon Linux는 Security Group으로 관리하므로 별도 방화벽 설정 불필요
echo "Please configure Security Group in AWS Console:"
echo "- Port 80 (HTTP)"
echo "- Port 443 (HTTPS)"
echo "- Port 22 (SSH)"

# 11. 스왑 메모리 설정 (메모리 부족 방지)
echo -e "${YELLOW}11. Setting up swap memory...${NC}"
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo "/swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab

# 12. 시스템 리소스 제한 증가
echo -e "${YELLOW}12. Increasing system limits...${NC}"
cat << EOF | sudo tee -a /etc/security/limits.conf
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# 13. 환경 변수 설정 파일 생성
echo -e "${YELLOW}13. Creating environment setup file...${NC}"
cat << 'EOF' > ~/.signalspot_env
# SignalSpot Environment Variables
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Use Node.js 18
nvm use 18 > /dev/null 2>&1

# Project directory
export SIGNALSPOT_HOME="/home/ec2-user/signalspot"
EOF

# .bashrc에 추가
echo "source ~/.signalspot_env" >> ~/.bashrc

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
echo "4. Run the deployment script:"
echo "   cd ~/signalspot"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh production"
echo ""
echo "5. Configure Nginx (if not already done)"
echo ""
echo -e "${GREEN}System information:${NC}"
echo "Node.js: $(node --version 2>/dev/null || echo 'Please restart shell')"
echo "npm: $(npm --version 2>/dev/null || echo 'Please restart shell')"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "PM2: $(pm2 --version 2>/dev/null || echo 'Please restart shell')"