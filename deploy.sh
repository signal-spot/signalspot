#!/bin/bash

# SignalSpot EC2 배포 스크립트
# Usage: ./deploy.sh [production|staging]

set -e  # 에러 발생시 스크립트 중단

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 환경 설정
ENV=${1:-production}
PROJECT_DIR="/home/ubuntu/signalspot"
BACKEND_DIR="${PROJECT_DIR}/apps/backend"
DOCKER_COMPOSE_FILE="${PROJECT_DIR}/docker-compose.production.yml"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SignalSpot Deployment Script${NC}"
echo -e "${GREEN}Environment: ${ENV}${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 프로젝트 디렉토리로 이동
echo -e "${YELLOW}1. Navigating to project directory...${NC}"
cd ${PROJECT_DIR}

# 2. 최신 코드 가져오기
echo -e "${YELLOW}2. Pulling latest code from git...${NC}"
git fetch origin
git reset --hard origin/main
git pull origin main

# 3. Docker Compose로 PostgreSQL과 Redis 시작
echo -e "${YELLOW}3. Starting PostgreSQL and Redis with Docker Compose...${NC}"
docker-compose -f ${DOCKER_COMPOSE_FILE} up -d

# Docker 컨테이너 상태 확인
echo -e "${YELLOW}Checking Docker containers status...${NC}"
docker-compose -f ${DOCKER_COMPOSE_FILE} ps

# 4. 데이터베이스가 준비될 때까지 대기
echo -e "${YELLOW}4. Waiting for PostgreSQL to be ready...${NC}"
until docker exec signalspot-postgres pg_isready -U postgres -d signalspot; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done
echo -e "${GREEN}PostgreSQL is ready!${NC}"

# 5. Redis가 준비될 때까지 대기
echo -e "${YELLOW}5. Checking Redis connection...${NC}"
until docker exec signalspot-redis redis-cli ping; do
  echo "Waiting for Redis..."
  sleep 2
done
echo -e "${GREEN}Redis is ready!${NC}"

# 6. Backend 디렉토리로 이동
echo -e "${YELLOW}6. Navigating to backend directory...${NC}"
cd ${BACKEND_DIR}

# 7. 환경 파일 확인
echo -e "${YELLOW}7. Checking environment files...${NC}"
if [ ! -f ".env.${ENV}" ]; then
    echo -e "${RED}Error: .env.${ENV} file not found!${NC}"
    echo "Please create .env.${ENV} file with required environment variables"
    exit 1
fi

# .env.production을 .env로 복사 (NestJS가 읽을 수 있도록)
cp .env.${ENV} .env

# 8. Dependencies 설치
echo -e "${YELLOW}8. Installing dependencies...${NC}"
npm ci --production=false  # devDependencies도 필요 (build를 위해)

# 9. 빌드
echo -e "${YELLOW}9. Building application...${NC}"
npm run build

# 10. 마이그레이션 실행
echo -e "${YELLOW}10. Running database migrations...${NC}"
npx mikro-orm migration:up

# 11. PM2로 애플리케이션 시작/재시작
echo -e "${YELLOW}11. Starting/Restarting application with PM2...${NC}"
if pm2 list | grep -q "signalspot-api"; then
    echo "Reloading existing PM2 process..."
    pm2 reload ecosystem.config.js --env ${ENV}
else
    echo "Starting new PM2 process..."
    pm2 start ecosystem.config.js --env ${ENV}
fi

# 12. PM2 프로세스 저장
echo -e "${YELLOW}12. Saving PM2 process list...${NC}"
pm2 save

# 13. PM2 시작 스크립트 설정 (시스템 재부팅시 자동 시작)
echo -e "${YELLOW}13. Setting up PM2 startup script...${NC}"
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

# 14. Nginx 설정 확인 및 리로드
echo -e "${YELLOW}14. Checking and reloading Nginx...${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo nginx -s reload
    echo -e "${GREEN}Nginx reloaded successfully${NC}"
else
    echo -e "${RED}Nginx configuration test failed!${NC}"
    exit 1
fi

# 15. 헬스체크
echo -e "${YELLOW}15. Running health check...${NC}"
sleep 5  # 서버가 완전히 시작될 때까지 대기

# 로컬호스트로 헬스체크
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ $HEALTH_CHECK -eq 200 ]; then
    echo -e "${GREEN}Health check passed!${NC}"
else
    echo -e "${RED}Health check failed with status code: ${HEALTH_CHECK}${NC}"
    echo "Checking PM2 logs..."
    pm2 logs signalspot-api --lines 50 --nostream
    exit 1
fi

# 16. 배포 상태 확인
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Summary:${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Docker Containers:"
docker ps | grep signalspot

echo ""
echo "PM2 Process:"
pm2 list

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}API is available at: https://lettie-dating.co.kr/signalspot${NC}"
echo -e "${GREEN}========================================${NC}"

# 로그 확인 명령어 안내
echo ""
echo "Useful commands:"
echo "- View logs: pm2 logs signalspot-api"
echo "- Monitor: pm2 monit"
echo "- Stop: pm2 stop signalspot-api"
echo "- Restart: pm2 restart signalspot-api"
echo "- Docker logs: docker-compose -f ${DOCKER_COMPOSE_FILE} logs -f"