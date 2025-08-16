# SignalSpot 프론트엔드 구조

## 기술 스택
- **플랫폼**: Expo (React Native)
- **언어**: TypeScript
- **UI 라이브러리**: React Native Paper (Material Design)
- **네비게이션**: React Navigation v7
- **상태 관리**: React Context + Custom Hooks
- **API 통신**: Axios with interceptors
- **지도**: Expo Maps (Google Maps 대체)
- **위치**: Expo Location
- **이미지**: Expo Image Picker
- **저장소**: AsyncStorage

## 디렉토리 구조
```
apps/frontend/src/
├── components/
├── screens/
│   ├── auth/ (LoginScreen, RegisterScreen)
│   ├── main/ (FeedScreen, MapScreen, SparksScreen, MySignalsScreen)
│   └── SignalCreateScreen
├── services/ (api, auth, signal, spark)
├── contexts/ (AuthContext)
├── navigation/ (AuthNavigator, MainTabNavigator, RootNavigator)
├── types/ (TypeScript 인터페이스)
└── utils/
```

## 주요 화면
1. **Auth Flow**: 로그인/회원가입
2. **Main Tabs**: Feed, Map, Sparks, MySignals
3. **Modal**: Signal 생성

## API 서비스
- authService: 로그인/회원가입/로그아웃
- signalService: 시그널 CRUD, 좋아요
- sparkService: 스파크 요청/응답

## 네비게이션 구조
- RootNavigator (인증 상태에 따른 분기)
  - AuthNavigator (로그인/회원가입)
  - MainTabNavigator (4개 탭)
    - SignalCreateScreen (모달)

마지막 업데이트: 2025-07-31