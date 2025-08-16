# SignalSpot API 응답 패턴 및 원칙

## 백엔드 API 응답 구조 표준

### 1. 기본 응답 구조
모든 API 응답은 다음 구조를 따름:
```typescript
{
  success: boolean,
  data: T | T[],  // 실제 데이터
  message: string,
  count?: number,  // 리스트 응답인 경우
  metadata?: {     // 추가 메타데이터
    requestId: string,
    responseTime: string
  }
}
```

### 2. 리스트 응답 (nearby, trending, popular 등)
```typescript
// 백엔드
return {
  success: true,
  data: spots.map(spot => ({
    ...spot.getSummary(),
    isLiked: spot.hasUserLiked(user.id)  // 사용자별 상태 추가
  })),
  count: spots.length,
  message: 'Signal Spots retrieved successfully'
};
```

### 3. 단일 객체 응답 (getById)
```typescript
// 백엔드
return {
  success: true,
  data: {
    ...spot.getSummary(),
    isLiked: spot.hasUserLiked(user.id)
  },
  message: 'Signal Spot retrieved successfully'
};
```

### 4. 액션 응답 (like, comment 등)
```typescript
// 백엔드 - 좋아요 토글
return {
  success: true,
  data: {
    spotId: id,
    isLiked: result.isLiked,
    likeCount: result.likeCount
  },
  message: result.isLiked ? 'Signal Spot liked' : 'Signal Spot unliked'
};
```

## 프론트엔드 서비스 패턴

### 1. API 응답 처리 원칙
```dart
// 정상 패턴 - getNearbySignalSpots
if (response.data is Map && response.data['success'] == true) {
  final data = response.data['data'] as List;
  
  final spots = <SignalSpot>[];
  for (var spotData in data) {
    // 백엔드 필드명 -> 프론트엔드 모델 매핑
    final mappedData = {
      'id': spotData['id'],
      'userId': spotData['creatorId'] ?? spotData['userId'],
      'content': spotData['message'] ?? spotData['content'],
      // ... 필드 매핑
    };
    
    // isLiked 상태 처리
    if (spotData['isLiked'] != null) {
      if (mappedData['engagement'] == null) {
        mappedData['engagement'] = {};
      }
      mappedData['engagement']['isLiked'] = spotData['isLiked'];
    }
    
    spots.add(SignalSpot.fromJson(mappedData));
  }
  
  return SignalSpotListResponse(
    data: spots,
    count: spots.length,
    success: true,
    message: response.data['message'] ?? '',
  );
}
```

### 2. 액션 응답 처리 (좋아요 등)
```dart
// toggleLike 메서드
final response = await _apiClient.dio.post('/signal-spots/$spotId/like');

if (response.data['success'] == true && response.data['data'] != null) {
  final likeData = response.data['data'] as Map<String, dynamic>;
  return {
    'isLiked': likeData['isLiked'] ?? false,
    'likeCount': likeData['likeCount'] ?? 0,
  };
}
```

## API 연결 원칙

### 1. 백엔드 컨트롤러 우선 확인
- 모든 API 작업 시 백엔드 controller.ts의 실제 응답 구조 확인
- @ApiResponse 데코레이터의 schema 정의 참고
- 실제 return 문의 구조가 최우선

### 2. 필드 매핑 규칙
백엔드 -> 프론트엔드 필드 매핑:
- `creatorId` -> `userId`
- `message` -> `content`
- `location.latitude/longitude` -> `latitude/longitude`
- `timing.createdAt` -> `createdAt`
- `engagement.*` -> 그대로 사용

### 3. 사용자별 상태 처리
- `isLiked`: 백엔드에서 data 객체의 최상위에 추가되는 경우가 많음
- 프론트엔드에서 `engagement` 객체 내부로 이동시켜 저장
- UI에서는 `engagement['isLiked']`로 접근

### 4. 에러 방지 체크리스트
- [ ] 백엔드 응답의 실제 구조 확인 (console.log로 출력)
- [ ] data가 배열인지 객체인지 확인
- [ ] 필수 필드 존재 여부 체크
- [ ] null/undefined 처리 (??  연산자 사용)
- [ ] 타입 캐스팅 정확성 확인

### 5. 공통 에러 패턴
1. **타입 에러**: `type 'Null' is not a subtype of type 'String'`
   - 원인: 백엔드 응답 구조와 프론트엔드 기대값 불일치
   - 해결: 실제 응답 구조 확인 후 매핑 수정

2. **필드 누락**: `isLiked` 상태가 표시 안됨
   - 원인: 백엔드 응답의 위치와 프론트엔드 접근 위치 불일치
   - 해결: 응답 데이터 구조 확인 후 올바른 경로로 접근

3. **리스트/객체 혼동**: 데이터 파싱 실패
   - 원인: 단일 객체를 리스트로 처리하거나 반대
   - 해결: API 응답 타입 확인 후 적절한 처리

## 검증된 작동 패턴
1. **getNearbySignalSpots**: 리스트 응답 + isLiked 상태 포함
2. **getSpotById**: 단일 객체 + isLiked 상태 포함  
3. **toggleLike**: 액션 결과만 반환 (전체 객체 X)
4. **getComments**: 리스트 + 각 comment별 isLiked 상태