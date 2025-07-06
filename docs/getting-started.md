# 시그널 개발 시작 가이드

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
# 프로젝트 클론 (이미 완료된 경우 생략)
git clone <repository-url>
cd signalspot

# 의존성 설치
npm install
```

### 2. 개발 환경 설정

#### 2.1 사전 요구사항 확인

```bash
# Node.js 버전 확인 (18 이상 필요)
node --version

# npm 버전 확인 (9 이상 필요)
npm --version

# PostgreSQL 설치 확인
psql --version
```

#### 2.2 PostgreSQL 설정

```bash
# PostgreSQL 설치 (macOS)
brew install postgresql
brew install postgis

# 데이터베이스 생성
createdb signalspot_dev
createdb signalspot_test

# PostGIS 확장 설치
psql -d signalspot_dev -c "CREATE EXTENSION postgis;"
psql -d signalspot_test -c "CREATE EXTENSION postgis;"
```

#### 2.3 환경 변수 설정

```bash
# 백엔드 환경 변수 설정
cp backend/.env.example backend/.env

# 프론트엔드 환경 변수 설정
cp frontend/.env.example frontend/.env
```

### 3. 개발 서버 실행

```bash
# 백엔드와 프론트엔드 동시 실행
npm run dev

# 개별 실행
npm run backend:dev  # 백엔드만
npm run frontend:dev # 프론트엔드만
```

### 4. 모바일 앱 실행

```bash
# iOS 시뮬레이터
cd frontend
npx react-native run-ios

# Android 에뮬레이터
cd frontend
npx react-native run-android
```

## 📋 다음 단계

### Phase 1: MVP 개발 시작

1. **백엔드 NestJS 프로젝트 생성**
   ```bash
   cd backend
   npm i -g @nestjs/cli
   nest new . --skip-git
   ```

2. **프론트엔드 React Native 프로젝트 생성**
   ```bash
   cd frontend
   npx react-native init SignalSpot --template react-native-template-typescript
   ```

3. **데이터베이스 설정**
   ```bash
   cd backend
   npm install @nestjs/typeorm typeorm pg @types/pg
   npm install @nestjs/config
   ```

### 주요 개발 태스크

- [ ] 1.1 백엔드 NestJS 프로젝트 초기 설정
- [ ] 1.2 프론트엔드 React Native 프로젝트 초기 설정
- [ ] 1.3 데이터베이스 설정
- [ ] 2.1 백엔드 인증 모듈 구현
- [ ] 2.2 프론트엔드 인증 시스템 구현

자세한 개발 태스크는 [development-tasks.md](./development-tasks.md)를 참고하세요.

## 🔧 유용한 명령어

### 프로젝트 관리

```bash
# 전체 테스트 실행
npm run test

# 전체 린트 검사
npm run lint

# 프로덕션 빌드
npm run backend:build
npm run frontend:build:ios
npm run frontend:build:android
```

### 개발 도구

```bash
# 백엔드 개발 서버 (자동 재시작)
npm run backend:dev

# 프론트엔드 Metro 번들러 시작
npm run frontend:dev

# 프론트엔드 개발자 메뉴 열기
npx react-native start --reset-cache
```

### 데이터베이스 관리

```bash
# 마이그레이션 생성
cd backend
npm run migration:generate -- -n MigrationName

# 마이그레이션 실행
npm run migration:run

# 데이터베이스 리셋
npm run migration:revert
```

## 🛠 개발 환경 상세 설정

### VS Code 확장 프로그램 (권장)

- **TypeScript**: 타입스크립트 지원
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포매팅
- **React Native Tools**: React Native 개발 도구
- **GitLens**: Git 히스토리 관리
- **Auto Rename Tag**: HTML/JSX 태그 자동 수정
- **Bracket Pair Colorizer**: 괄호 색상 구분

### 디버깅 설정

#### React Native 디버깅

```bash
# Flipper 설치 (권장)
brew install --cask flipper

# React Native Debugger 설치
brew install --cask react-native-debugger
```

#### 백엔드 디버깅

```bash
# NestJS 개발 서버 디버그 모드
npm run start:debug
```

## 🚨 문제 해결

### 일반적인 문제

1. **Metro 번들러 캐시 이슈**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS 빌드 실패**
   ```bash
   cd frontend/ios
   rm -rf Pods Podfile.lock
   pod install
   ```

3. **Android 빌드 실패**
   ```bash
   cd frontend/android
   ./gradlew clean
   ```

4. **데이터베이스 연결 오류**
   - PostgreSQL 서비스 실행 확인
   - 환경 변수 설정 확인
   - 데이터베이스 존재 여부 확인

### 성능 최적화

1. **백엔드 성능**
   - 데이터베이스 쿼리 최적화
   - 캐싱 전략 적용
   - 비동기 처리 활용

2. **프론트엔드 성능**
   - 이미지 최적화
   - 메모리 사용량 모니터링
   - 렌더링 최적화

## 📚 참고 자료

### 공식 문서

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [React Native 공식 문서](https://reactnative.dev/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

### 유용한 라이브러리

- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Styled Components](https://styled-components.com/)

### 커뮤니티

- [NestJS 한국 커뮤니티](https://nestjs.kr/)
- [React Native 한국 커뮤니티](https://reactnative.dev/community)
- [개발자를 위한 레시피](https://recipes.dev/)

## 💡 팁

1. **코드 품질 유지**
   - ESLint, Prettier 설정 활용
   - 코드 리뷰 필수
   - 테스트 코드 작성

2. **효율적인 개발**
   - Hot Reload 활용
   - 개발자 도구 적극 활용
   - 디버깅 도구 숙지

3. **협업**
   - Git 브랜치 전략 수립
   - 커밋 메시지 규칙 설정
   - 이슈 트래킹 활용

---

**✨ 행복한 개발 되세요!**

문제가 발생하면 [Issues](https://github.com/your-username/signalspot/issues)에서 도움을 요청하세요. 