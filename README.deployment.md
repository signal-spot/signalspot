# SignalSpot EC2 배포 가이드

## 아키텍처 구성

```
[클라이언트] 
    ↓ HTTPS
[Nginx (기존)] 
    ↓ /signalspot/* → localhost:3000
[PM2 Cluster] 
    ↓
[NestJS App (여러 인스턴스)]
    ↓
[Docker Compose]
    ├── PostgreSQL + PostGIS (포트: 5432)
    └── Redis (포트: 6379)
```

## 사전 준비사항

### 1. EC2 서버 환경
- Ubuntu 20.04+ 또는 Amazon Linux 2
- Node.js 18+ 설치
- PM2 설치 (`npm install -g pm2`)
- Docker & Docker Compose 설치
- Git 설치
- Nginx 설치 (기존 사용)

### 2. 필요한 포트
- 3000: NestJS API (내부)
- 3001: WebSocket (내부)
- 5432: PostgreSQL (내부)
- 6379: Redis (내부)
- 80/443: Nginx (외부)

## 배포 단계

### 1단계: 코드 클론 및 환경 설정

```bash
# 1. 프로젝트 클론
cd /home/ubuntu
git clone https://github.com/signal-spot/signalspot.git
cd signalspot

# 2. 환경 파일 생성
cd apps/backend
cp .env.production.example .env.production
# .env.production 파일을 편집하여 실제 값 입력
nano .env.production

# 3. Firebase 서비스 계정 파일 복사
# signalspot-firebase-adminsdk.json 파일을 apps/backend/ 디렉토리에 복사

# 4. 실행 권한 부여
cd /home/ubuntu/signalspot
chmod +x deploy.sh
```

### 2단계: Docker Compose로 인프라 구성

```bash
# 1. Docker Compose 파일 확인
cat docker-compose.production.yml

# 2. PostgreSQL과 Redis 시작
docker-compose -f docker-compose.production.yml up -d

# 3. 컨테이너 상태 확인
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs

# 4. PostgreSQL 접속 테스트
docker exec -it signalspot-postgres psql -U postgres -d signalspot
```

### 3단계: NestJS 애플리케이션 빌드 및 실행

```bash
cd apps/backend

# 1. 의존성 설치
npm ci

# 2. 빌드
npm run build

# 3. 데이터베이스 마이그레이션
npx mikro-orm migration:up

# 4. PM2로 실행
pm2 start ecosystem.config.js --env production

# 5. PM2 프로세스 저장
pm2 save

# 6. 시스템 재부팅시 자동 시작 설정
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# 출력된 명령어를 복사하여 실행
```

### 4단계: Nginx 설정

```bash
# 1. Nginx 설정 파일 복사
sudo cp nginx.signalspot.conf /etc/nginx/sites-available/signalspot
sudo ln -s /etc/nginx/sites-available/signalspot /etc/nginx/sites-enabled/

# 2. 기존 Nginx 설정 백업
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 3. Nginx 설정 테스트
sudo nginx -t

# 4. Nginx 재시작
sudo nginx -s reload
```

### 5단계: SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치 (이미 설치되어 있다면 스킵)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급 (이미 있다면 스킵)
sudo certbot --nginx -d lettie-dating.co.kr

# 자동 갱신 설정 확인
sudo certbot renew --dry-run
```

## 자동 배포 스크립트 사용

모든 설정이 완료된 후에는 제공된 배포 스크립트를 사용할 수 있습니다:

```bash
cd /home/ubuntu/signalspot
./deploy.sh production
```

## 운영 관리

### PM2 명령어

```bash
# 프로세스 목록 확인
pm2 list

# 로그 확인
pm2 logs signalspot-api
pm2 logs signalspot-api --lines 100

# 모니터링
pm2 monit

# 재시작
pm2 restart signalspot-api

# 리로드 (무중단)
pm2 reload signalspot-api

# 중지
pm2 stop signalspot-api

# 삭제
pm2 delete signalspot-api

# 프로세스 정보
pm2 describe signalspot-api

# CPU/메모리 사용량
pm2 status
```

### Docker 명령어

```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.production.yml ps

# 로그 확인
docker-compose -f docker-compose.production.yml logs -f postgres
docker-compose -f docker-compose.production.yml logs -f redis

# 재시작
docker-compose -f docker-compose.production.yml restart

# 중지
docker-compose -f docker-compose.production.yml stop

# 시작
docker-compose -f docker-compose.production.yml start

# 완전 제거 (데이터 유지)
docker-compose -f docker-compose.production.yml down

# 완전 제거 (데이터 삭제)
docker-compose -f docker-compose.production.yml down -v
```

### 데이터베이스 백업

```bash
# PostgreSQL 백업
docker exec signalspot-postgres pg_dump -U postgres signalspot > backup_$(date +%Y%m%d_%H%M%S).sql

# 백업 복원
docker exec -i signalspot-postgres psql -U postgres signalspot < backup_20240101_120000.sql
```

### 로그 관리

```bash
# PM2 로그 위치
/home/ubuntu/.pm2/logs/

# Nginx 로그
/var/log/nginx/signalspot_access.log
/var/log/nginx/signalspot_error.log

# 로그 로테이션 설정
sudo nano /etc/logrotate.d/signalspot
```

## 트러블슈팅

### 1. 포트 충돌
```bash
# 포트 사용 확인
sudo lsof -i :3000
sudo lsof -i :5432
sudo lsof -i :6379

# 프로세스 종료
sudo kill -9 [PID]
```

### 2. 메모리 부족
```bash
# 메모리 사용량 확인
free -h
pm2 monit

# PM2 메모리 제한 조정
# ecosystem.config.js의 max_memory_restart 값 수정
```

### 3. 데이터베이스 연결 실패
```bash
# PostgreSQL 상태 확인
docker exec signalspot-postgres pg_isready

# 연결 테스트
docker exec signalspot-postgres psql -U postgres -c "SELECT 1"

# 로그 확인
docker logs signalspot-postgres
```

### 4. 502 Bad Gateway
```bash
# PM2 프로세스 확인
pm2 list

# 애플리케이션 로그 확인
pm2 logs signalspot-api --err

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/signalspot_error.log
```

## 성능 최적화

### 1. PM2 클러스터 모드
```javascript
// ecosystem.config.js
instances: 'max', // CPU 코어 수만큼 인스턴스 생성
// 또는
instances: 4, // 특정 개수 지정
```

### 2. PostgreSQL 튜닝
```sql
-- 연결 풀 크기 조정
ALTER SYSTEM SET max_connections = 200;

-- 메모리 설정
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- 설정 적용
SELECT pg_reload_conf();
```

### 3. Redis 최적화
```bash
# Redis 설정 수정
docker exec signalspot-redis redis-cli CONFIG SET maxmemory 256mb
docker exec signalspot-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## 모니터링 설정

### 1. PM2 Plus (선택사항)
```bash
pm2 link [secret_key] [public_key]
```

### 2. 헬스체크 엔드포인트
```bash
# 내부 헬스체크
curl http://localhost:3000/health

# 외부 헬스체크
curl https://lettie-dating.co.kr/signalspot/health
```

### 3. 시스템 모니터링
```bash
# CPU/메모리 모니터링
htop

# 디스크 사용량
df -h

# 네트워크 상태
netstat -tuln
```

## 보안 체크리스트

- [ ] 방화벽 설정 (ufw 또는 Security Group)
- [ ] SSH 키 인증만 허용
- [ ] 환경 변수 파일 권한 설정 (chmod 600)
- [ ] 데이터베이스 비밀번호 복잡도 확인
- [ ] JWT Secret 안전성 확인
- [ ] CORS 설정 확인
- [ ] Rate Limiting 설정
- [ ] SQL Injection 방어 확인
- [ ] XSS 방어 헤더 설정
- [ ] 정기 백업 스케줄 설정

## 업데이트 절차

1. 코드 업데이트
```bash
cd /home/ubuntu/signalspot
git pull origin main
```

2. 의존성 업데이트
```bash
cd apps/backend
npm ci
```

3. 빌드
```bash
npm run build
```

4. 마이그레이션 (필요시)
```bash
npx mikro-orm migration:up
```

5. PM2 리로드 (무중단)
```bash
pm2 reload signalspot-api
```

## 롤백 절차

1. 이전 버전으로 되돌리기
```bash
git reset --hard [previous_commit_hash]
```

2. 재빌드 및 배포
```bash
npm run build
pm2 reload signalspot-api
```

3. 데이터베이스 롤백 (필요시)
```bash
npx mikro-orm migration:down
```