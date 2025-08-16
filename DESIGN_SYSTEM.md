# SignalSpot 디자인 시스템

## 디자인 원칙

### 미니멀리즘
- 토스 디자인 철학을 기반으로 불필요한 장식을 제거하고 콘텐츠에 집중
- 정보 계층 구조를 명확히 하여 사용자의 인지 부하 최소화
- 화면당 하나의 주요 액션에 집중

### 일관성
- Material Design 3 (Material You) 가이드라인을 따름
- Flutter의 네이티브 위젯을 최대한 활용
- 동일한 기능은 항상 같은 시각적 표현 사용

### 접근성
- WCAG 2.1 AA 기준 준수
- 색상 대비비 4.5:1 이상 유지
- 터치 타겟 최소 44x44pt
- 스크린 리더 지원

### 부드러운 인터랙션
- 60fps 유지를 위한 최적화
- 자연스러운 애니메이션과 제스처 반응
- 사용자 행동에 즉각적인 피드백 제공

## 컬러 팔레트

### Primary Colors
```dart
static const Color primaryColor = Color(0xFF6750A4);      // 보라빛 - 신비로운 인연을 상징
static const Color secondaryColor = Color(0xFF625B71);    // 차분한 보조색
```

### Surface Colors
```dart
static const Color surfaceColor = Color(0xFFFFFBFE);      // 깨끗한 배경
static const Color backgroundColor = Color(0xFFF5F5F5);   // 전체 배경
```

### Semantic Colors
```dart
static const Color errorColor = Color(0xFFBA1A1A);        // 경고/오류
static const Color successColor = Color(0xFF31A354);      // 성공/긍정
static const Color sparkActiveColor = Color(0xFFFFD700);  // 골드 - 활성화된 스파크
```

### Gradient Colors
```dart
// 시간대별 그라데이션
static const LinearGradient morningGradient = LinearGradient(
  colors: [Color(0xFFFFE0B2), Color(0xFFFFCC02)],
);
static const LinearGradient eveningGradient = LinearGradient(
  colors: [Color(0xFF6750A4), Color(0xFF9C27B0)],
);
```

## 타이포그래피

### 텍스트 스타일
```dart
// 헤드라인
static const TextStyle headlineLarge = TextStyle(
  fontSize: 32,
  fontWeight: FontWeight.w700,
  letterSpacing: -0.5,
);

static const TextStyle headlineMedium = TextStyle(
  fontSize: 24,
  fontWeight: FontWeight.w600,
  letterSpacing: -0.25,
);

// 바디 텍스트
static const TextStyle bodyLarge = TextStyle(
  fontSize: 16,
  fontWeight: FontWeight.w400,
  height: 1.5,
);

static const TextStyle bodyMedium = TextStyle(
  fontSize: 14,
  fontWeight: FontWeight.w400,
  height: 1.4,
);

// 라벨
static const TextStyle labelLarge = TextStyle(
  fontSize: 14,
  fontWeight: FontWeight.w500,
  letterSpacing: 0.5,
);
```

## 스페이싱 시스템

```dart
static const double spacingXs = 4.0;    // 최소 간격
static const double spacingSm = 8.0;    // 작은 간격
static const double spacingMd = 16.0;   // 기본 간격
static const double spacingLg = 24.0;   // 큰 간격
static const double spacingXl = 32.0;   // 최대 간격
static const double spacingXxl = 48.0;  // 섹션 간 간격
```

## 컴포넌트 디자인

### 버튼
```dart
// Primary Button
ElevatedButton(
  style: ElevatedButton.styleFrom(
    backgroundColor: AppColors.primaryColor,
    foregroundColor: Colors.white,
    elevation: 2,
    shadowColor: AppColors.primaryColor.withOpacity(0.3),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    padding: EdgeInsets.symmetric(
      horizontal: AppSpacing.spacingLg,
      vertical: AppSpacing.spacingMd,
    ),
  ),
)

// Secondary Button
OutlinedButton(
  style: OutlinedButton.styleFrom(
    foregroundColor: AppColors.primaryColor,
    side: BorderSide(color: AppColors.primaryColor),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),
)
```

### 입력 필드
```dart
TextFormField(
  decoration: InputDecoration(
    filled: true,
    fillColor: AppColors.surfaceColor,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.grey.shade300),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: AppColors.primaryColor, width: 2),
    ),
    contentPadding: EdgeInsets.all(AppSpacing.spacingMd),
  ),
)
```

### 카드
```dart
Card(
  elevation: 2,
  shadowColor: Colors.black.withOpacity(0.1),
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(16),
  ),
  child: Padding(
    padding: EdgeInsets.all(AppSpacing.spacingMd),
    child: // 내용
  ),
)
```

## 네비게이션 구조

### 정보 구조 (Information Architecture)
```
[앱 진입]
 ┣━ 0. 스플래시 스크린
 ┃   ┣━ 로고 애니메이션 (Lottie)
 ┃   ┗━ 자동 로그인 체크
 ┃
 ┣━ 1. 온보딩 (최초 1회)
 ┃   ┣━ 1.1. 환영 화면 (3단계 스와이프)
 ┃   ┣━ 1.2. 권한 요청 (단계별 설명)
 ┃   ┣━ 1.3. 프로필 설정 (필수)
 ┃   ┣━ 1.4. 시그니처 커넥션 설정
 ┃   ┗━ 1.5. 튜토리얼 (인터랙티브)
 ┃
 ┗━ 2. 메인 앱
     ┣━ 바텀 네비게이션 (5개 탭)
     ┃   ┣━ 🏠 홈 (통합 피드)
     ┃   ┣━ 📍 스팟 (지도)
     ┃   ┣━ ⚡ 스파크 (중앙 버튼)
     ┃   ┣━ 💬 채팅
     ┃   ┗━ 👤 프로필
     ┃
     ┗━ 글로벌 기능
         ┣━ 실시간 알림
         ┣━ 딥링크 처리
         ┣━ 백그라운드 작업
         ┗━ 오프라인 모드
```

## 화면별 상세 디자인

### 온보딩 프로세스

#### 1-0. 스플래시 스크린
- 중앙: 시그널 로고 (펄스 애니메이션)
- 하단: 로딩 프로그레스 (은은한 표시)
- 배경: 그라데이션 애니메이션 (보라 → 분홍)
- 기술 사양: Lottie 애니메이션, 2초 최소 노출

#### 1-1. 환영 화면 (PageView)
1. 첫 번째 페이지: "우연을 필연으로"
2. 두 번째 페이지: "당신의 흔적이 누군가의 운명"
3. 세 번째 페이지: "오늘도 새로운 인연이 기다려요"

#### 1-2. 권한 요청 (단계별)
- 위치 권한 요청 화면
- 알림 권한 요청 화면

### 메인 홈 화면

#### 통합 피드 구성
- 헤더 영역: 로고 + 알림 아이콘
- 오늘의 스파크 요약 카드
- HOT 시그널 스팟 (가로 스크롤)
- 내 주변 새 쪽지
- 추천 스파크 (AI 기반)

### 시그널 스팟 (지도)

#### 지도 메인 화면
- Google Maps 기반
- 쪽지 핀: 기본(파랑), 인기(빨강), 내 쪽지(금색)
- 클러스터링 및 히트맵 모드
- 하단 정보 패널 (접기/펼치기)

### 스파크 시스템

#### 스파크 메인 화면
- 중앙 스파크 버튼 (하단 네비게이션)
- 활성화 상태 표시
- 스파크 리스트 (새로운 | 대기중 | 매칭됨)

#### 매칭 프로세스
1. 새로운 스파크: 액션 대기
2. 시그널 보냄: 상대 응답 대기 (72시간)
3. 매칭 성공: 채팅 가능

## 애니메이션 가이드

### 트랜지션
```dart
// 페이지 전환
PageTransition.fadeThrough(duration: Duration(milliseconds: 300))

// 버튼 터치 피드백
ScaleTransition(scale: _scaleAnimation, child: button)

// 로딩 스피너
CircularProgressIndicator(
  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
)
```

### 제스처
- 스와이프: 페이지 전환, 카드 액션
- 길게 누르기: 컨텍스트 메뉴, 빠른 액션
- 더블 탭: 좋아요, 확대

## 반응형 디자인

### 브레이크포인트
```dart
static const double mobileBreakpoint = 600;
static const double tabletBreakpoint = 1024;
static const double desktopBreakpoint = 1440;
```

### 그리드 시스템
- Mobile: 4 columns
- Tablet: 8 columns  
- Desktop: 12 columns

## 다크 모드 지원

### 다크 컬러 팔레트
```dart
static const Color darkPrimaryColor = Color(0xFF7B68EE);
static const Color darkSurfaceColor = Color(0xFF121212);
static const Color darkBackgroundColor = Color(0xFF000000);
```

## 아이콘 시스템

### 아이콘 라이브러리
- Material Icons (기본)
- Custom SVG Icons (브랜드 전용)

### 아이콘 사이즈
```dart
static const double iconXs = 16.0;
static const double iconSm = 20.0;
static const double iconMd = 24.0;
static const double iconLg = 32.0;
static const double iconXl = 48.0;
```

## 성능 최적화 가이드

### 이미지 최적화
- WebP 포맷 사용
- 캐시된 네트워크 이미지
- 적절한 이미지 사이즈 사용

### 위젯 최적화
- const 생성자 적극 활용
- Keys 사용으로 불필요한 리빌드 방지
- ListView.builder 사용

### 메모리 관리
- dispose() 메서드 구현
- Stream/Animation 컨트롤러 정리
- 이미지 캐시 관리