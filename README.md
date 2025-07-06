# 시그널 (Signal) - React Native & NestJS Edition

> 물리적 공간과 디지털 경험을 결합하여 진정한 인간 관계를 만드는 플랫폼

## 📋 프로젝트 개요

시그널은 2-Track 전략으로 구성된 소셜 미디어 플랫폼입니다:

- **Track A (시그널 스팟)**: 공개/바이럴 엔진 - 지역 기반 쪽지 플랫폼
- **Track B (시그널 스파크)**: 비공개/리텐션 엔진 - 우연한 만남 감지 시스템

## 🛠 기술 스택

### Backend
- **NestJS Framework** - TypeScript 기반의 모듈형 아키텍처
- **Node.js** - 런타임 환경
- **PostgreSQL + PostGIS** - 위치 기반 쿼리 처리
- **TypeORM** - 데이터베이스 ORM
- **Passport.js (JWT)** - 인증 시스템
- **WebSocket Gateway** - 실시간 채팅
- **NestJS Scheduler** - 백그라운드 작업 처리

### Frontend
- **React Native** - 크로스 플랫폼 모바일 앱 개발
- **TypeScript** - 타입 안정성
- **React Navigation** - 앱 내 네비게이션
- **React Query (TanStack Query)** - 서버 상태 관리
- **styled-components** - 스타일링

### Infrastructure
- **AWS / GCP / Vercel** - 클라우드 인프라
- **RDS** - 데이터베이스 호스팅
- **S3** - 파일 저장소
- **CDN** - 콘텐츠 전송 네트워크

## 📁 프로젝트 구조

```
signalspot/
├── backend/              # NestJS 백엔드
│   ├── src/
│   │   ├── auth/         # 인증 모듈
│   │   ├── users/        # 사용자 관리 모듈
│   │   ├── spots/        # 시그널 스팟 모듈
│   │   ├── sparks/       # 시그널 스파크 모듈
│   │   ├── chat/         # 채팅 모듈
│   │   ├── common/       # 공통 모듈
│   │   └── database/     # 데이터베이스 설정
│   ├── package.json
│   └── nest-cli.json
├── frontend/             # React Native 앱
│   ├── src/
│   │   ├── components/   # 공통 컴포넌트
│   │   ├── screens/      # 화면 컴포넌트
│   │   ├── navigation/   # 네비게이션 설정
│   │   ├── services/     # API 서비스
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── types/        # TypeScript 타입 정의
│   │   └── utils/        # 유틸리티 함수
│   ├── package.json
│   └── metro.config.js
├── shared/               # 공통 타입 정의
│   └── types/
├── docs/                 # 문서
├── .taskmaster/          # 태스크 관리
└── README.md
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn
- PostgreSQL 14+
- PostGIS 확장
- React Native 개발 환경 설정

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd signalspot
   ```

2. **백엔드 설정**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

3. **프론트엔드 설정**
   ```bash
   cd frontend
   npm install
   npx react-native run-ios    # iOS
   npx react-native run-android  # Android
   ```

## 📋 개발 단계

### Phase 1: MVP (최소 기능 제품)
- [x] 프로젝트 초기 설정
- [ ] 기본 사용자 인증 시스템
- [ ] 시그널 스팟 기본 기능 (지도 기반 쪽지 작성/조회)
- [ ] 간단한 프로필 설정

### Phase 2: 스파크 시스템 도입
- [ ] 위치 기반 매칭 시스템
- [ ] 푸시 알림 시스템
- [ ] 1:1 채팅 기능

### Phase 3: 고도화
- [ ] 성지 시스템
- [ ] SNS 공유 기능
- [ ] 통합 피드 '오늘의 인연'

## 🔒 개인정보 보호

본 프로젝트는 **Privacy by Design** 원칙을 준수합니다:
- 사용자의 명시적 동의 후 위치 정보 수집
- 최소한의 데이터만 수집 및 저장
- 데이터 암호화 및 보안 통신
- 사용자가 언제든지 데이터 삭제 가능

## 📊 성공 지표

### 플랫폼 목표
- 월간 활성 사용자 100만 명 달성
- 사용자 리텐션 70% 이상 유지
- 일일 평균 사용 시간 20분 이상

### Track A (시그널 스팟)
- 주간 쪽지 작성 수 50만 개 이상
- 쪽지 조회율 80% 이상
- SNS 공유율 30% 이상

### Track B (시그널 스파크)
- 스파크 감지 정확도 85% 이상
- 매칭 성공률 60% 이상
- 1:1 채팅 전환율 40% 이상

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 언제든지 연락해주세요. 