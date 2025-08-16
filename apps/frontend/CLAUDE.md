# SignalSpot 프론트엔드 개발 가이드라인

Claude Code를 위한 SignalSpot Flutter 프론트엔드 개발 가이드라인입니다.

## 프론트엔드 코드 작업 규칙

### 코드 수정 가능
- **Flutter 코드 직접 수정 가능**: Claude Code는 프론트엔드 코드를 직접 수정할 수 있음
- **UI 컴포넌트 구현**: 위젯, 스크린, 컴포넌트 구현 가능
- **상태 관리**: Provider, Riverpod 등 상태 관리 구현 가능
- **API 연동**: 백엔드 API와의 통신 로직 구현 가능

### 개발 서버 실행 규칙
- **Flutter 개발 서버는 사용자가 직접 실행**: `flutter run` 명령어는 사용자가 실행
- **핫 리로드**: 코드 수정 후 자동으로 적용됨
- **디바이스 선택**: 사용자가 직접 디바이스/시뮬레이터 선택

## API 연동 필수 규칙

### 1. 백엔드 우선 확인 원칙
- **백엔드 컨트롤러 직접 확인**: 모든 API 연동 작업 시 백엔드의 controller.ts 파일에서 직접 API 스펙 확인
- **실제 return 문 확인**: @ApiResponse 데코레이터보다 실제 return 문의 구조가 최우선
- **DTO 검증**: 백엔드 DTO 파일에서 정확한 요청/응답 형식 파악

### 2. 백엔드 API 응답 표준 구조
```typescript
// 모든 API 응답 기본 구조
{
  success: boolean,
  data: T | T[],     // 실제 데이터 (객체 또는 배열)
  message: string,
  count?: number,    // 리스트 응답인 경우
  metadata?: {       // 추가 메타데이터
    requestId: string,
    responseTime: string
  }
}
```

### 3. Flutter 응답 처리 원칙
```dart
// 1. 응답 구조 확인
if (response.data['success'] == true && response.data['data'] != null) {
  
  // 2. 데이터 타입 확인 (배열 vs 객체)
  final data = response.data['data'];
  
  // 3. 필드 매핑 (백엔드 -> 프론트엔드)
  // creatorId -> userId
  // message -> content  
  // location.latitude -> latitude
  // timing.createdAt -> createdAt
  
  // 4. 사용자별 상태 처리 (isLiked 등)
  if (data['isLiked'] != null) {
    // engagement 객체에 추가
    data['engagement'] ??= {};
    data['engagement']['isLiked'] = data['isLiked'];
  }
}
```

### 4. API 연동 체크리스트
- [ ] **백엔드 컨트롤러의 실제 return 문 확인**
- [ ] **응답의 data가 배열인지 객체인지 확인**
- [ ] **필드명 매핑 규칙 적용 (creatorId->userId, message->content 등)**
- [ ] **isLiked 같은 사용자별 상태 올바른 위치에 저장**
- [ ] **null 안전 처리 (?? 연산자 사용)**
- [ ] **에러 응답 처리 로직 구현**

### 5. 자주 발생하는 에러와 해결법

#### `type 'Null' is not a subtype of type 'String'`
- **원인**: 백엔드 응답 구조와 프론트엔드 기대값 불일치
- **해결**: print()로 실제 응답 확인 → 올바른 경로로 데이터 접근

#### `isLiked` 상태가 UI에 반영 안됨
- **원인**: 백엔드는 data 최상위에, 프론트엔드는 engagement 내부에서 찾음
- **해결**: 응답 처리 시 isLiked를 engagement 객체로 이동

#### 좋아요 토글 후 전체 데이터 누락
- **원인**: 액션 API는 최소 데이터만 반환 (전체 객체 X)
- **해결**: 필요한 필드만 업데이트, 전체 새로고침 필요시 별도 조회

## 프로젝트 구조

```
apps/frontend/
├── lib/
│   ├── core/           # 핵심 기능
│   │   ├── theme/      # 테마, 색상, 타이포그래피
│   │   ├── utils/      # 유틸리티 함수
│   │   └── constants/  # 상수 정의
│   ├── components/     # 재사용 가능한 위젯
│   │   ├── common/     # 공통 컴포넌트
│   │   ├── map/        # 지도 관련 컴포넌트
│   │   ├── signal/     # 시그널 관련 컴포넌트
│   │   └── spark/      # 스파크 관련 컴포넌트
│   ├── screens/        # 화면 위젯
│   │   ├── auth/       # 인증 화면
│   │   ├── main/       # 메인 화면들
│   │   └── settings/   # 설정 화면
│   ├── services/       # API 서비스
│   ├── models/         # 데이터 모델
│   ├── providers/      # 상태 관리
│   ├── navigation/     # 네비게이션
│   └── main.dart       # 진입점
├── assets/            # 이미지, 폰트 등
├── android/           # Android 플랫폼 코드
├── ios/              # iOS 플랫폼 코드
└── pubspec.yaml      # 패키지 의존성
```

## 개발 환경 설정

### 필수 도구
- Flutter SDK 3.0+
- Dart SDK 3.0+
- iOS 시뮬레이터 (iOS 개발 시)
- Android Studio (Android 개발 시)
- Visual Studio Code 또는 Android Studio IDE

### 개발 명령어
```bash
# Flutter 앱 실행 (디버그 모드)
flutter run

# Flutter 앱 실행 (특정 디바이스)
flutter run -d <device-id>

# Flutter 웹 실행
flutter run -d chrome

# 의존성 설치
flutter pub get

# 코드 분석
flutter analyze

# 테스트 실행
flutter test

# 빌드 (Android APK)
flutter build apk

# 빌드 (iOS)
flutter build ios

# 클린 빌드
flutter clean && flutter pub get
```

## 코딩 표준

### 기본 원칙
- 항상 null safety 사용
- 명시적 타입 주석 사용 (public API)
- `dynamic` 타입 금지 (타입 안전성 확보)
- 제네릭과 Dart 고급 타입 적극 활용

### 디자인 시스템 구현
- **디자인 시스템 문서**: `/DESIGN_SYSTEM.md` 파일 참조
- **Flutter 테마 구현**: `lib/core/theme/` 디렉토리의 테마 파일들 사용
  - `AppColors`: 컬러 팔레트 정의
  - `AppSpacing`: 스페이싱 및 사이즈 시스템
  - `AppTextStyles`: 타이포그래피 정의
  - `AppTheme`: 통합 테마 구성
- **사용법**: `import 'core/theme/theme.dart';`로 모든 테마 요소 import
- **Material Design 3**: Material You 가이드라인 준수, `useMaterial3: true` 설정

### 위젯 구조
```dart
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool isLoading;
  
  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.isLoading = false,
  });
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: _getButtonStyle(context),
      child: isLoading 
        ? const CircularProgressIndicator()
        : Text(text),
    );
  }
}
```

### 성능 최적화
```dart
// const 생성자와 keys 사용으로 불필요한 리빌드 방지
class SignalListItem extends StatelessWidget {
  final Signal signal;
  final ValueChanged<String> onTap;
  
  const SignalListItem({
    super.key,
    required this.signal,
    required this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return ListTile(
      key: ValueKey(signal.id),
      title: Text(signal.title),
      subtitle: Text(signal.description),
      onTap: () => onTap(signal.id),
    );
  }
}

// ListView.builder로 대량 데이터 처리
ListView.builder(
  itemCount: signals.length,
  itemBuilder: (context, index) {
    return SignalListItem(
      signal: signals[index],
      onTap: _handleSignalTap,
    );
  },
)
```

## 상태 관리

### Provider/Riverpod 패턴
```dart
// Provider 정의
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

// StateNotifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  
  AuthNotifier(this._authService) : super(AuthState.initial());
  
  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final user = await _authService.login(email, password);
      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }
}

// 위젯에서 사용
class LoginScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    
    return Scaffold(
      body: authState.isLoading
        ? const LoadingIndicator()
        : LoginForm(),
    );
  }
}
```

## API 서비스 구현

### Dio 클라이언트 설정
```dart
class ApiClient {
  late final Dio _dio;
  
  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:3000/api',
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 3),
    ));
    
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(LogInterceptor());
  }
  
  Future<Response> get(String path, {Map<String, dynamic>? params}) {
    return _dio.get(path, queryParameters: params);
  }
  
  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }
}
```

### 서비스 구현 예시
```dart
class SignalSpotService {
  final ApiClient _apiClient;
  
  SignalSpotService(this._apiClient);
  
  Future<List<SignalSpot>> getNearbySpots({
    required double latitude,
    required double longitude,
    double radiusKm = 1.0,
  }) async {
    try {
      final response = await _apiClient.get('/signal-spots/nearby', params: {
        'latitude': latitude,
        'longitude': longitude,
        'radiusKm': radiusKm,
      });
      
      if (response.data['success'] == true) {
        final data = response.data['data'] as List;
        return data.map((json) => SignalSpot.fromJson(json)).toList();
      }
      throw Exception(response.data['message']);
    } catch (e) {
      throw Exception('Failed to fetch nearby spots: $e');
    }
  }
}
```

## 패키지 관리

### 주요 패키지
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # 상태 관리
  flutter_riverpod: ^2.4.0
  
  # 라우팅
  go_router: ^12.0.0
  
  # HTTP 클라이언트
  dio: ^5.3.0
  
  # 위치 서비스
  location: ^5.0.0
  google_maps_flutter: ^2.5.0
  
  # 로컬 저장소
  shared_preferences: ^2.2.0
  
  # 환경변수
  flutter_dotenv: ^5.1.0
  
  # UI
  material_color_utilities: ^0.8.0
  cached_network_image: ^3.3.0
```

## 테스트

### 단위 테스트
```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SignalSpot Model Tests', () {
    test('should create SignalSpot from JSON', () {
      final json = {
        'id': '123',
        'message': 'Test message',
        'latitude': 37.5665,
        'longitude': 126.9780,
      };
      
      final spot = SignalSpot.fromJson(json);
      
      expect(spot.id, '123');
      expect(spot.message, 'Test message');
      expect(spot.latitude, 37.5665);
      expect(spot.longitude, 126.9780);
    });
  });
}
```

### 위젯 테스트
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('SignalCard displays message', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: SignalCard(
          message: 'Test Signal',
          onTap: () {},
        ),
      ),
    );
    
    expect(find.text('Test Signal'), findsOneWidget);
  });
}
```

## 환경변수 관리

### .env 파일 설정
```bash
# API 설정
API_BASE_URL=http://localhost:3000/api

# Google Maps
GOOGLE_MAPS_API_KEY_ANDROID=your_android_key_here
GOOGLE_MAPS_API_KEY_IOS=your_ios_key_here

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_API_KEY=your_api_key
```

### 사용법
```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  runApp(const SignalSpotApp());
}

// 사용 예시
final apiBaseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
final googleMapsApiKey = dotenv.env['GOOGLE_MAPS_API_KEY_ANDROID'];
```

## 코드 검증 체크리스트

### 필수 검증 사항
- [ ] Flutter analyze 에러 확인 (`flutter analyze`)
- [ ] Dart formatter 실행 (`dart format .`)
- [ ] 빌드 성공 여부 확인 (`flutter build apk --debug`)
- [ ] 테스트 통과 여부 확인 (`flutter test`)

### 코드 품질
- [ ] Null safety 준수
- [ ] 타입 안정성 확보
- [ ] const 생성자 사용
- [ ] 불필요한 setState 제거
- [ ] 메모리 누수 방지 (dispose 구현)

### UI/UX
- [ ] 반응형 레이아웃 구현
- [ ] 로딩 상태 표시
- [ ] 에러 상태 처리
- [ ] 빈 상태 UI
- [ ] 접근성 지원

### 성능
- [ ] ListView.builder 사용 (대량 데이터)
- [ ] 이미지 캐싱 구현
- [ ] 불필요한 리빌드 방지
- [ ] 비동기 처리 최적화

## 중요 원칙

### "빨간줄 제로" 원칙
- IDE에서 빨간 밑줄(에러 표시)이 하나도 없을 때까지 수정 계속
- 컴파일 에러 우선 해결
- 런타임 에러보다 컴파일 타임 에러를 먼저 해결

### 완료 기준
1. IDE에서 빨간줄이 단 하나도 없음
2. Flutter analyze 통과
3. 빌드 성공
4. 위 3가지 조건이 모두 충족되어야 작업 완료