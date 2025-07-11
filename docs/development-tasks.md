# 시그널 개발 태스크 목록

## 🎯 Phase 1: MVP (최소 기능 제품) - 8주

### 1. 프로젝트 초기 설정 (1주)
- [ ] **1.1** 백엔드 NestJS 프로젝트 초기 설정
  - NestJS CLI 설치 및 프로젝트 생성
  - TypeScript 설정 및 ESLint, Prettier 설정
  - 환경 변수 설정 (.env 파일 구성)
  - 기본 모듈 구조 생성

- [ ] **1.2** 프론트엔드 React Native 프로젝트 초기 설정
  - React Native CLI 설치 및 프로젝트 생성
  - TypeScript 설정
  - React Navigation 설치 및 기본 구조 설정
  - 개발 환경 설정 (iOS/Android)

- [x] **1.3** 데이터베이스 설정 ✅ **COMPLETED - MikroORM Migration**
  - PostgreSQL 설치 및 설정
  - PostGIS 확장 설치
  - ~~TypeORM 설정 및 데이터베이스 연결~~ → **MikroORM 설정 및 데이터베이스 연결 완료**
  - 마이그레이션 설정 완료

### 2. 인증 시스템 구축 (1주)
- [ ] **2.1** 백엔드 인증 모듈 구현
  - Passport.js 및 JWT 설정
  - 사용자 회원가입/로그인 API 구현
  - 비밀번호 해싱 및 보안 설정
  - 토큰 refresh 로직 구현

- [ ] **2.2** 프론트엔드 인증 시스템 구현
  - 로그인/회원가입 화면 구현
  - 토큰 저장 및 관리 (AsyncStorage)
  - 인증 상태 관리 (Context API)
  - 자동 로그인 기능 구현

### 3. 사용자 관리 시스템 (1주)
- [ ] **3.1** 사용자 프로필 모델 설계
  - User 엔티티 정의 (TypeORM)
  - 프로필 이미지 업로드 기능
  - 사용자 정보 CRUD API 구현
  - 프로필 데이터 유효성 검사

- [ ] **3.2** 프로필 관리 화면 구현
  - 프로필 등록/수정 화면
  - 이미지 선택 및 업로드 기능
  - 취향 정보 입력 폼 (시그니처 커넥션)
  - 프로필 미리보기 기능

### 4. 시그널 스팟 핵심 기능 구현 (3주)
- [ ] **4.1** 지도 기반 쪽지 시스템 - 백엔드
  - Spot 엔티티 정의 (위치 좌표 포함)
  - 지리 기반 쿼리 구현 (PostGIS 활용)
  - 쪽지 작성/조회/삭제 API 구현
  - 위치 기반 필터링 API 구현

- [ ] **4.2** 지도 기반 쪽지 시스템 - 프론트엔드
  - react-native-maps 라이브러리 통합
  - 지도 화면 구현 (현재 위치 표시)
  - 쪽지 작성 모달 구현
  - 지도 위 쪽지 마커 표시 기능

- [ ] **4.3** 쪽지 상세 기능 구현
  - 쪽지 상세 보기 화면
  - '나일지도?' 버튼 기능 구현
  - 쪽지 좋아요/댓글 기능
  - 쪽지 신고 기능

### 5. 기본 UI/UX 구현 (1주)
- [ ] **5.1** 디자인 시스템 구축
  - 컬러 팔레트 및 타이포그래피 정의
  - 공통 컴포넌트 라이브러리 구축
  - styled-components 설정
  - 반응형 디자인 적용

- [ ] **5.2** 메인 네비게이션 구현
  - 탭 네비게이션 구현
  - 화면 전환 애니메이션
  - 헤더 및 바텀 탭 디자인
  - 접근성 고려사항 적용

### 6. 테스트 및 배포 준비 (1주)
- [ ] **6.1** 테스트 환경 구축
  - Jest 설정 및 단위 테스트 작성
  - API 테스트 구현
  - E2E 테스트 환경 설정
  - 코드 커버리지 설정

- [ ] **6.2** 배포 환경 구축
  - 백엔드 배포 설정 (AWS/Vercel)
  - 데이터베이스 마이그레이션 자동화
  - 앱 빌드 및 배포 파이프라인 구축
  - 환경별 설정 관리

## 🚀 Phase 2: 스파크 시스템 도입 - 10주

### 7. 위치 기반 매칭 시스템 (3주)
- [ ] **7.1** 위치 추적 시스템 구현
  - react-native-background-geolocation 설정
  - 위치 권한 요청 플로우 구현
  - 백그라운드 위치 수집 로직
  - 위치 데이터 최적화 및 배터리 관리

- [ ] **7.2** 스파크 감지 알고리즘 구현
  - 위치 데이터 처리 백그라운드 잡 구현
  - 근접 사용자 감지 로직 (PostGIS 활용)
  - 시그니처 커넥션 매칭 로직
  - 스파크 생성 및 저장 로직

### 8. 푸시 알림 시스템 (2주)
- [ ] **8.1** 푸시 알림 백엔드 구현
  - Firebase Cloud Messaging 설정
  - 푸시 알림 발송 API 구현
  - 알림 템플릿 및 개인화 기능
  - 알림 발송 스케줄링

- [ ] **8.2** 푸시 알림 프론트엔드 구현
  - @react-native-firebase/messaging 설정
  - 푸시 알림 수신 및 처리
  - 알림 권한 요청 및 토큰 관리
  - 딥링크 처리 구현

### 9. 1:1 채팅 시스템 (3주)
- [ ] **9.1** 실시간 채팅 백엔드 구현
  - WebSocket Gateway 설정
  - 채팅방 생성 및 관리 로직
  - 메시지 저장 및 조회 API
  - 채팅 보안 및 암호화

- [ ] **9.2** 채팅 프론트엔드 구현
  - socket.io-client 설정
  - 채팅 화면 UI 구현
  - 실시간 메시지 송수신
  - 채팅 히스토리 관리

### 10. 스파크 로그 및 매칭 화면 (2주)
- [ ] **10.1** 스파크 로그 화면 구현
  - 스파크 발생 이력 표시
  - 스파크 상세 정보 화면
  - 매칭 수락/거절 기능
  - 스파크 통계 대시보드

- [ ] **10.2** 매칭 관리 기능
  - 매칭된 사용자 목록
  - 매칭 상태 관리
  - 차단 및 신고 기능
  - 매칭 해제 기능

## 🎨 Phase 3: 고도화 - 6주

### 11. 성지 시스템 (2주)
- [ ] **11.1** 성지 등급 시스템 구현
  - 위치별 쪽지 밀도 계산 로직
  - 성지 등급 분류 알고리즘
  - 성지 정보 캐싱 시스템
  - 성지 순위 및 통계 API

- [ ] **11.2** 성지 표시 기능 구현
  - 지도 위 성지 아이콘 렌더링
  - 성지 정보 툴팁 표시
  - 성지 상세 정보 화면
  - 성지 방문 기록 기능

### 12. SNS 공유 기능 (2주)
- [ ] **12.1** 쪽지 카드 생성 기능
  - react-native-view-shot 설정
  - 쪽지 디자인 카드 템플릿
  - 이미지 생성 및 최적화
  - 공유 메타데이터 설정

- [ ] **12.2** 소셜 공유 기능 구현
  - 네이티브 Share API 활용
  - 플랫폼별 공유 최적화
  - 공유 추적 및 분석
  - 바이럴 효과 측정

### 13. 통합 피드 '오늘의 인연' (2주)
- [ ] **13.1** 통합 피드 백엔드 구현
  - 개인화 알고리즘 구현
  - 피드 데이터 집계 로직
  - 피드 캐싱 및 최적화
  - 피드 업데이트 알림

- [ ] **13.2** 통합 피드 프론트엔드 구현
  - 하이브리드 피드 UI 구현
  - 무한 스크롤 기능
  - 피드 아이템 인터랙션
  - 피드 새로고침 기능

## 🔧 지속적 개선 및 운영

### 14. 성능 최적화
- [ ] **14.1** 백엔드 성능 최적화
  - 데이터베이스 쿼리 최적화
  - 캐싱 전략 구현
  - API 응답 시간 개선
  - 메모리 사용량 최적화

- [ ] **14.2** 프론트엔드 성능 최적화
  - 앱 번들 사이즈 최적화
  - 렌더링 성능 개선
  - 메모리 누수 방지
  - 네트워크 요청 최적화

### 15. 보안 및 개인정보 보호
- [ ] **15.1** 보안 강화
  - API 보안 감사
  - 데이터 암호화 강화
  - 인증 시스템 개선
  - 취약점 점검 및 패치

- [ ] **15.2** 개인정보 보호 강화
  - 개인정보 처리 방침 구현
  - 데이터 최소화 원칙 적용
  - 사용자 동의 관리
  - 데이터 삭제 권한 구현

### 16. 모니터링 및 분석
- [ ] **16.1** 서버 모니터링 시스템
  - 로그 수집 및 분석
  - 성능 지표 모니터링
  - 에러 추적 시스템
  - 알림 시스템 구축

- [ ] **16.2** 사용자 행동 분석
  - 사용자 이벤트 추적
  - 앱 사용 패턴 분석
  - A/B 테스트 플랫폼
  - 비즈니스 지표 대시보드

## 📊 우선순위 및 일정

### 높은 우선순위 (즉시 시작)
1. ~~프로젝트 초기 설정 (1.1, 1.2, 1.3)~~ → **1.3 데이터베이스 설정 완료 (MikroORM Migration)**
2. 인증 시스템 구축 (2.1, 2.2)
3. 사용자 관리 시스템 (3.1, 3.2)

### 🚨 **최근 완료된 주요 인프라 업그레이드**
- **TypeORM → MikroORM 마이그레이션 완료** (2025-07-08)
  - 모든 백엔드 모듈 활성화 완료
  - 52개 TypeORM 관련 에러 수정 완료
  - 모든 TypeORM 패턴을 MikroORM으로 변환 완료
  - 백엔드 빌드 및 실행 성공 확인

### 중간 우선순위 (MVP 완료 후)
1. 시그널 스팟 핵심 기능 (4.1, 4.2, 4.3)
2. 기본 UI/UX 구현 (5.1, 5.2)
3. 테스트 및 배포 준비 (6.1, 6.2)

### 낮은 우선순위 (장기 계획)
1. 스파크 시스템 (7.1, 7.2, 8.1, 8.2, 9.1, 9.2)
2. 고도화 기능 (11.1, 11.2, 12.1, 12.2, 13.1, 13.2)
3. 운영 최적화 (14.1, 14.2, 15.1, 15.2, 16.1, 16.2)

## 📝 참고사항

### 기술적 고려사항
- 모든 API는 RESTful 원칙을 따르며 GraphQL 도입 검토
- 실시간 기능은 WebSocket 기반으로 구현
- 위치 데이터는 개인정보 보호를 최우선으로 처리
- 확장 가능한 아키텍처 설계 필수

### 비즈니스 고려사항
- 사용자 경험(UX)을 최우선으로 고려
- 개인정보 보호 법규 준수
- 확장성을 고려한 인프라 설계
- 비용 효율적인 솔루션 선택

### 팀 협업
- 코드 리뷰 필수
- 문서화 철저히
- 테스트 커버리지 80% 이상 유지
- 애자일 방법론 적용 