# Docker Configuration Guide

SignalSpot 프로젝트의 Docker 환경 설정 가이드입니다.

## 🐳 Docker 설정 개요

### 프로덕션 환경
- **Backend**: NestJS 애플리케이션 (멀티스테이지 빌드)
- **Frontend**: React Native 웹/모바일 빌드
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Tools**: Adminer (DB 관리)

### 개발 환경
- Hot reload 지원
- 볼륨 마운팅으로 실시간 코드 변경 반영
- 디버그 포트 노출 (9229)
- Metro bundler 포트 노출 (8081)

## 🚀 실행 방법

### 프로덕션 환경 실행
```bash
# 전체 스택 실행
docker-compose up -d

# 백엔드만 실행
docker-compose up backend postgres redis

# Metro bundler 포함 모바일 개발
docker-compose --profile mobile-dev up

# 개발 도구 포함
docker-compose --profile tools up
```

### 개발 환경 실행
```bash
# 개발 환경 전체 실행
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 서비스별 재시작
docker-compose -f docker-compose.dev.yml restart backend
```

## 🔧 환경 설정

### 필수 환경 변수
`.env.example`을 복사하여 `.env` 파일 생성:
```bash
cp .env.example .env
```

### 주요 환경 변수
- `DB_*`: 데이터베이스 설정
- `REDIS_*`: Redis 설정
- `JWT_SECRET`: JWT 토큰 시크릿
- `METRO_PORT`: Metro bundler 포트 (기본: 8081)
- `ADMINER_PORT`: Adminer 포트 (기본: 8080)

## 📍 서비스 포트

### 프로덕션 환경
- Backend: `3000`
- PostgreSQL: `5432`
- Redis: `6379`
- Metro (mobile-dev): `8081`
- Adminer (tools): `8081`

### 개발 환경
- Backend: `3000`
- Backend Debug: `9229`
- PostgreSQL: `5432`
- Redis: `6379`
- Metro: `8081`
- Adminer: `8080`

## 🧪 헬스체크

모든 서비스에 헬스체크가 구성되어 있습니다:
```bash
# 서비스 상태 확인
docker-compose ps

# 특정 서비스 헬스체크 로그
docker-compose logs backend
```

## 🛠️ 유용한 명령어

### 데이터베이스 초기화
```bash
# 볼륨 삭제 후 재시작
docker-compose down -v
docker-compose up -d
```

### 이미지 재빌드
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 특정 서비스만 재빌드
docker-compose build backend
```

### 개발 환경 디버깅
```bash
# 컨테이너 내부 접근
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres signalspot

# 실시간 로그 모니터링
docker-compose logs -f backend
```

## 📦 볼륨 관리

### 프로덕션 볼륨
- `postgres_data`: PostgreSQL 데이터
- `redis_data`: Redis 데이터
- `metro_cache`: Metro bundler 캐시

### 개발 볼륨
- `postgres_dev_data`: 개발용 PostgreSQL 데이터
- `redis_dev_data`: 개발용 Redis 데이터
- `metro_dev_cache`: 개발용 Metro 캐시

## 🚨 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :8081

# .env 파일에서 포트 변경
BACKEND_PORT=3001
METRO_PORT=8082
```

### 권한 문제
```bash
# 소유권 변경
sudo chown -R $USER:$USER ./
```

### 캐시 정리
```bash
# Docker 캐시 정리
docker system prune -a

# 볼륨 정리
docker volume prune
```