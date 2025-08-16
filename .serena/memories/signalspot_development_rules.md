# SignalSpot 개발 규칙 요약

## 필수 도구 사용 규칙
1. **Serena MCP 우선**: 모든 코드 작업에서 Serena MCP 도구 우선 사용
2. **Expo SDK 우선**: 네이티브 기능은 항상 Expo 패키지 우선 선택
3. **Context7 MCP**: 최신 라이브러리 정보 확인 시 사용

## 라이브러리 선택 가이드
### ✅ 권장
- expo-location (위치)
- expo-maps (지도)
- expo-image-picker (이미지)
- react-native-paper (UI)
- @react-navigation/* (네비게이션)

### ❌ 회피
- react-native-maps (네이티브 모듈 문제)
- react-native-location
- 커스텀 네이티브 모듈

## AI 할루시네이션 방지
1. **명시적 타입 정의**: any 타입 금지
2. **표준 파일 구조**: 일관된 디렉토리 구조
3. **컴포넌트 표준 구조**: 7단계 구조 준수
4. **함수 분리**: 단일 책임 원칙
5. **커스텀 훅 활용**: 비즈니스 로직 분리

## 성능 최적화
- React.memo 사용
- useCallback, useMemo 적극 활용
- FlatList 최적화 (removeClippedSubviews 등)
- 이미지 최적화

## 에러 처리
- 표준화된 AppError 클래스
- handleApiError 유틸리티 함수
- 사용자 친화적 에러 메시지

## Serena MCP 활용 체크리스트
- find_symbol: 기존 코드 검색
- get_symbols_overview: 파일 구조 파악
- search_for_pattern: 패턴 분석
- replace_symbol_body: 안전한 수정
- write_memory: 지식 저장
- find_referencing_symbols: 의존성 추적