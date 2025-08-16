# SignalSpot API 엔드포인트

## 기본 설정
- **Base URL**: http://localhost:3000/api (개발 환경)
- **인증**: JWT Bearer Token
- **자동 갱신**: Refresh Token 사용

## Auth 엔드포인트
- POST /auth/login - 로그인
- POST /auth/register - 회원가입
- POST /auth/logout - 로그아웃
- POST /auth/refresh - 토큰 갱신

## Signal 엔드포인트
- GET /signals/feed - 피드 시그널 목록
- GET /signals/nearby - 주변 시그널 (위치 기반)
- GET /signals/my - 내 시그널 목록
- POST /signals - 시그널 생성
- POST /signals/:id/like - 좋아요
- DELETE /signals/:id/like - 좋아요 취소
- DELETE /signals/:id - 시그널 삭제

## Spark 엔드포인트
- GET /sparks - 스파크 목록
- POST /sparks - 스파크 보내기
- PUT /sparks/:id/accept - 스파크 수락
- PUT /sparks/:id/reject - 스파크 거절

## 요청/응답 형태
### 로그인 요청
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 로그인 응답
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### 시그널 생성 요청
```json
{
  "title": "Signal Title",
  "content": "Signal content",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "mediaUrls": ["image_url1", "image_url2"]
}
```