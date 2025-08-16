# SignalSpot 백엔드 리팩토링 계획

## 분석 결과 요약

### 1. 미구현 기능 (TODO 항목)
- **이메일 인증**: auth.service.ts - 이메일 전송 기능 미구현
- **Firebase 토큰 검증**: Firebase Admin SDK 연동 미구현
- **알림 기능**: 좋아요/댓글 알림 미구현
- **친구 시스템**: 친구 관계 확인 로직 미구현
- **연락 추적**: SignatureConnection 연락 추적 미구현
- **상호 연결**: SignatureConnection 상호 연결 미구현
- **댓글 삭제**: 실제 댓글 삭제 로직 미구현
- **관리자 권한 체크**: Report 컨트롤러에 proper admin check 미구현

### 2. 보안 이슈
- console.log 사용 (프로덕션 환경에서 제거 필요)
- 하드코딩된 비밀번호 경고 메시지
- 이메일 토큰이 콘솔에 노출

### 3. 코드 품질 이슈
- **중복 코드**: 여러 서비스에서 유사한 페이지네이션 로직
- **일관성 부족**: 에러 처리 방식이 컨트롤러마다 다름
- **미사용 import**: 일부 파일에 사용하지 않는 import 존재

### 4. 아키텍처 개선 필요
- **인터셉터 중복**: ErrorHandlingInterceptor, ResponseTransformInterceptor 중복 적용
- **Guard 일관성**: 일부 컨트롤러는 VerifiedUserGuard 미사용
- **DTO 검증**: 일부 엔드포인트에 DTO 검증 부재

## 리팩토링 우선순위

### Phase 1: 보안 및 안정성 (긴급)
1. console.log 제거 및 Logger 서비스로 대체
2. 이메일 토큰 노출 문제 해결
3. Firebase Admin SDK 실제 구현
4. Admin Guard 적절한 구현

### Phase 2: 기능 완성 (중요)
1. 이메일 전송 서비스 구현 (Nodemailer 활용)
2. 알림 서비스 완성 (좋아요, 댓글 알림)
3. 댓글 삭제 기능 구현
4. 친구 시스템 기본 구현

### Phase 3: 코드 품질 (개선)
1. 페이지네이션 로직 중앙화
2. 에러 처리 표준화
3. DTO 검증 강화
4. 미사용 코드 제거

### Phase 4: 아키텍처 최적화 (장기)
1. Repository 패턴 일관성 개선
2. 캐싱 전략 구현
3. 이벤트 기반 아키텍처 강화
4. 테스트 커버리지 향상

## 구체적 작업 항목

### 1. Logger 서비스 구현
- Winston 또는 Pino 도입
- 환경별 로그 레벨 설정
- 로그 파일 로테이션

### 2. 이메일 서비스 구현
```typescript
// email.service.ts
- SendGrid 또는 AWS SES 연동
- 템플릿 기반 이메일 전송
- 이메일 큐 처리
```

### 3. Firebase Admin 초기화
```typescript
// firebase-admin.config.ts
- 서비스 계정 키 설정
- Admin SDK 초기화
- 토큰 검증 로직 구현
```

### 4. 친구 시스템 구현
```typescript
// friend.entity.ts
- Friend 엔티티 생성
- 친구 요청/수락/거절 로직
- 친구 목록 조회
```

### 5. 공통 유틸리티 생성
```typescript
// common/utils/pagination.util.ts
- 페이지네이션 헬퍼 함수
- 정렬 옵션 처리
- 메타데이터 생성
```

## 예상 작업 시간
- Phase 1: 2-3일
- Phase 2: 1주일
- Phase 3: 3-4일
- Phase 4: 2주일

## 위험 요소
- 기존 API 호환성 유지
- 데이터베이스 마이그레이션
- 프로덕션 배포 시 다운타임