# Firebase SMS 인증 reCAPTCHA 비활성화 가이드

## 적용된 변경사항

### 1. 코드 레벨 설정 (완료)
- `firebase_auth_service.dart`에서 `forceRecaptchaFlow: false` 설정 추가
- Android와 iOS 모두에서 reCAPTCHA 웹뷰 방지

### 2. Android Manifest 권한 추가 (완료)
- SMS 자동 읽기를 위한 권한 추가:
  - `android.permission.RECEIVE_SMS`
  - `android.permission.READ_SMS`

## Firebase Console 설정 (필수)

### 1. Firebase Console에서 설정
1. [Firebase Console](https://console.firebase.google.com)로 이동
2. 프로젝트 선택
3. **Authentication** → **Sign-in method** → **Phone** 설정

### 2. Android 앱 설정 확인
**Project Settings** → **Your apps** → **Android app**에서:

#### SHA 인증서 확인 (중요!)
모든 SHA 지문이 등록되어 있는지 확인:
- SHA-1 (디버그)
- SHA-256 (디버그)
- SHA-1 (릴리즈)
- SHA-256 (릴리즈)

현재 SHA 확인 명령어:
```bash
# 디버그 키
keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android

# 릴리즈 키 (upload-keystore.jks 사용)
keytool -list -v -alias upload -keystore android/app/upload-keystore.jks
```

### 3. SafetyNet/Play Integrity 설정
**Project Settings** → **App Check**에서:
- Android 앱의 App Check를 일시적으로 비활성화
- 또는 "Enforcement" 모드를 "Monitor only"로 변경

### 4. Phone Auth 설정
**Authentication** → **Settings** → **Authorized domains**:
- `localhost`
- `signalspot.com` (프로덕션 도메인)
- Firebase 기본 도메인들이 포함되어 있는지 확인

## 테스트 방법

### 1. 완전 클린 빌드
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

### 2. 테스트 시나리오
1. 앱 실행
2. 전화번호 입력 (+821012345678 형식)
3. "인증번호 전송" 클릭
4. **웹브라우저로 이동하지 않고** 바로 SMS 수신 확인
5. 인증번호 자동 입력 또는 수동 입력
6. 인증 완료

## 문제 해결

### 여전히 reCAPTCHA가 나타나는 경우

1. **SHA 지문 불일치**
   - Firebase Console의 SHA와 실제 앱의 SHA가 일치하는지 확인
   - `google-services.json` 파일 재다운로드 후 교체

2. **Play Integrity API 충돌**
   - Play Console에서 앱이 Play Integrity를 사용 중인지 확인
   - Firebase App Check 설정 확인

3. **Firebase 프로젝트 설정**
   - Package name: `com.signalspot.frontend` 확인
   - Application ID 일치 여부 확인

4. **네트워크 환경**
   - VPN 사용 시 비활성화 후 테스트
   - 실제 디바이스에서 테스트 (에뮬레이터 X)

### Silent SMS Verification (Android)
Android에서는 다음 조건이 충족되면 SMS를 자동으로 읽어 처리:
1. Google Play Services 최신 버전
2. 올바른 SHA 지문 등록
3. SMS 권한 허용
4. Firebase Auth SDK가 SMS 포맷 인식

## 주의사항

1. **프로덕션 배포 시**
   - 릴리즈 SHA 지문 반드시 등록
   - Play Store 업로드 시 Play App Signing 사용하면 추가 SHA 등록 필요

2. **iOS**
   - iOS는 이미 APNs를 통한 Silent Verification 지원
   - reCAPTCHA 대신 자동 인증 진행

3. **보안**
   - 테스트 전화번호 우회 코드는 프로덕션에서 제거
   - Firebase App Check는 프로덕션에서 활성화 권장