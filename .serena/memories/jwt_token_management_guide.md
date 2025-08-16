# JWT 토큰 관리 완전 가이드

## 토큰 관리 정책
- **Access Token**: 15분 만료 (보안성 우선)
- **Refresh Token**: 7일 만료 (사용성 고려)
- **자동 갱신**: 401 에러 시 자동으로 Refresh Token 사용
- **재로그인 기준**: Refresh Token 만료 시에만 로그인 화면으로 이동

## 핵심 컴포넌트
1. **Axios Interceptor**: 자동 토큰 첨부 및 갱신
2. **EventBus**: 전역 이벤트 관리 (토큰 만료 알림)
3. **AuthContext**: 인증 상태 관리
4. **useTokenStatus**: 토큰 상태 모니터링 훅
5. **useApiCall**: 표준 API 호출 훅

## 중요한 구현 패턴
- **중복 갱신 방지**: isRefreshing 플래그 사용
- **대기열 관리**: failedQueue로 동시 요청 처리
- **에러 분류**: 네트워크/서버/인증 에러 구분
- **상태 동기화**: EventBus로 전역 로그아웃 처리

## 파일 구조
- services/api.ts: Axios 설정 및 interceptor
- utils/eventBus.ts: 이벤트 버스
- contexts/AuthContext.tsx: 인증 컨텍스트
- hooks/useTokenStatus.ts: 토큰 상태 훅
- hooks/useApiCall.ts: API 호출 훅

## 에러 처리 표준
- 400: 잘못된 요청
- 401: 인증 필요 (자동 처리)
- 403: 권한 없음
- 404: 리소스 없음
- 500: 서버 오류
- Network: 연결 오류