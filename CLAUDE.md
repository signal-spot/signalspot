# SignalSpot 개발 가이드라인

Claude Code를 위한 SignalSpot 프로젝트 개발 가이드라인입니다.

## 중요 규칙

### 필수 도구 사용 규칙
- **Serena MCP를 우선적으로 사용**: 코드 수정, 파일 조작, 검색 등 모든 작업에서 Serena MCP 도구를 활용할 것
- 코드 분석, 파일 읽기/쓰기, 심볼 검색 등은 반드시 Serena MCP 사용
- 일반 도구는 Serena MCP로 불가능한 작업에만 사용

### 프론트엔드 작업 규칙
- 프론트엔드 코드 작성 및 수정 가능
- 프론트엔드 개발 서버 실행 가능
- 필요시 프론트엔드 관련 npm 스크립트 실행 가능

### Serena MCP 적극 활용 규칙
- **모든 코드 작업은 Serena MCP 우선**: 파일 읽기, 쓰기, 검색, 수정 등 모든 작업
- **심볼 기반 작업**: `find_symbol`, `replace_symbol_body`, `insert_after_symbol` 등 적극 활용
- **패턴 검색**: `search_for_pattern`으로 코드 패턴 및 문제점 찾기
- **메모리 관리**: `write_memory`, `read_memory`로 프로젝트 지식 저장 및 활용
- **코드 분석**: `get_symbols_overview`로 코드베이스 구조 파악
- **참조 분석**: `find_referencing_symbols`로 의존성 및 사용처 파악

## 프로젝트 구조

```
signalspot/
├── apps/
│   ├── backend/     # NestJS 백엔드 애플리케이션
│   └── frontend/    # React Native 프론트엔드
├── libs/           # 공유 라이브러리
├── tools/          # 빌드 도구
└── scripts/        # 유틸리티 스크립트
```

## 개발 환경 설정

### 필수 도구
- Node.js 18+
- Docker & Docker Compose
- React Native CLI
- iOS 시뮬레이터 (iOS 개발 시)
- Android Studio (Android 개발 시)

### 개발 서버 실행
```bash
# 백엔드 개발 서버
npm run dev:backend

# 프론트엔드 개발 서버
npm run dev:frontend

# 전체 개발 환경 (Docker)
docker-compose -f docker-compose.dev.yml up
```

## 코딩 표준

### TypeScript 기본 원칙
- 항상 strict 모드 사용
- 명시적 타입 주석 사용 (public API)
- `any` 타입 금지 (타입 가드 사용)
- 제네릭과 유틸리티 타입 적극 활용

### NestJS 백엔드 개발

#### 모듈 구조
```typescript
// 기능별 모듈 구성
@Module({
  imports: [MikroOrmModule.forFeature([User, UserProfile])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

#### 서비스 계층 패턴
```typescript
// 비즈니스 로직과 데이터 접근 분리
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // 비즈니스 로직 구현
    const user = await this.userRepository.create(dto);
    this.eventEmitter.emit('user.created', user);
    return user;
  }
}
```

#### 예외 처리
```typescript
// 커스텀 예외 클래스 사용
export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(`User ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}

// 서비스에서 예외 발생
if (!user) {
  throw new UserNotFoundException(userId);
}
```

#### 데이터베이스 최적화
```typescript
// N+1 문제 방지 - populate 사용
const users = await this.em.find(User, {}, { 
  populate: ['profile', 'roles'] 
});

// 필요한 필드만 조회
const users = await this.em.find(User, {}, { 
  fields: ['id', 'email', 'username'] 
});
```

### React Native 프론트엔드 개발

#### 디자인 시스템
```typescript
// 일관된 디자인 토큰 사용
export const DesignSystem = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  colors: {
    primary: '#007AFF',
    background: { primary: '#FFFFFF', secondary: '#F2F2F7' },
    text: { primary: '#000000', secondary: '#3C3C43' },
  },
  typography: {
    title1: { fontSize: 28, fontWeight: '700' },
    body: { fontSize: 17, fontWeight: '400' },
  },
} as const;
```

#### 컴포넌트 구조
```typescript
// 재사용 가능한 컴포넌트 설계
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  ...props 
}) => {
  const styles = useButtonStyles(variant, size);
  return (
    <Pressable style={styles.container} {...props}>
      {props.children}
    </Pressable>
  );
};
```

#### 성능 최적화
```typescript
// React.memo 사용으로 불필요한 리렌더링 방지
export const ListItem = React.memo<{
  item: Item;
  onPress: (id: string) => void;
}>(({ item, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{item.title}</Text>
    </TouchableOpacity>
  );
});
```

## 도메인 주도 설계 (DDD) 원칙

### 엔티티 설계
```typescript
// 풍부한 도메인 모델
export class User extends AggregateRoot {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _profile: UserProfile,
  ) {
    super();
  }

  static create(props: CreateUserProps): User {
    const user = new User(
      UserId.generate(),
      Email.create(props.email),
      UserProfile.create(props),
    );
    
    user.addDomainEvent(new UserCreatedEvent(user.id));
    return user;
  }

  public verifyEmail(): void {
    if (this.isVerified) {
      throw new DomainError('User already verified');
    }
    
    this._profile = this._profile.markAsVerified();
    this.addDomainEvent(new UserVerifiedEvent(this._id));
  }
}
```

### 값 객체 (Value Objects)
```typescript
// 원시 타입 강박 방지
export class Email {
  private constructor(private readonly value: string) {}
  
  static create(email: string): Email {
    if (!this.isValidFormat(email)) {
      throw new DomainError('Invalid email format');
    }
    return new Email(email.toLowerCase().trim());
  }
  
  toString(): string {
    return this.value;
  }
}
```

## 테스트 전략

### 단위 테스트
```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new UserService(mockRepository);
  });

  it('should create user successfully', async () => {
    const createUserDto = UserFactory.createDto();
    mockRepository.create.mockResolvedValue(UserFactory.create());
    
    const result = await service.createUser(createUserDto);
    
    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
  });
});
```

### 통합 테스트
```typescript
describe('User API', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('POST /users should create user', async () => {
    const createUserDto = { email: 'test@example.com' };
    
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);
      
    expect(response.body.email).toBe(createUserDto.email);
  });
});
```

## 보안 가이드라인

### 환경변수 관리 정책
- **모든 중요한 키는 환경변수로 관리**: API 키, 시크릿 키, 데이터베이스 연결 정보 등
- **코드에 직접 하드코딩 금지**: 보안 키를 소스코드에 직접 포함하지 않음
- **.env 파일 보안**: .gitignore에 .env 파일 포함하여 버전 관리에서 제외
- **환경별 설정 분리**: 개발, 스테이징, 프로덕션 환경별로 다른 키 사용

#### 환경변수 명명 규칙
```bash
# 프론트엔드 환경변수 (React Native)
REACT_NATIVE_KAKAO_MAP_API_KEY=your_api_key_here
REACT_NATIVE_API_BASE_URL=http://localhost:3000/api
REACT_NATIVE_GOOGLE_MAPS_API_KEY=your_google_key_here

# 백엔드 환경변수 (NestJS)
SIGNALSPOT_JWT_SECRET=your_jwt_secret_here
SIGNALSPOT_DB_HOST=localhost
SIGNALSPOT_DB_PASSWORD=your_db_password_here
KAKAO_REST_API_KEY=your_kakao_rest_key_here
```

#### 환경변수 사용 패턴
```typescript
// ✅ 올바른 환경변수 사용
const KAKAO_MAP_API_KEY = process.env.REACT_NATIVE_KAKAO_MAP_API_KEY;

if (!KAKAO_MAP_API_KEY) {
  throw new Error('REACT_NATIVE_KAKAO_MAP_API_KEY is not defined');
}

// ❌ 피해야 할 하드코딩
const KAKAO_MAP_API_KEY = 'testkey';
```

### 입력 검증
```typescript
// DTO 검증
export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;
}
```

### 인증 및 권한
```typescript
// JWT 가드 사용
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@GetUser() user: User) {
  return user;
}

// 역할 기반 접근 제어
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  // 관리자만 접근 가능
}
```

## 성능 최적화

### 데이터베이스 최적화
```typescript
// 인덱스 사용
@Entity()
export class User {
  @Index()
  @Property()
  email: string;
  
  @Index()
  @Property()
  username: string;
}

// 쿼리 최적화
const users = await this.em.find(User, {
  email: { $in: emails }
}, {
  populate: ['profile'],
  limit: 20,
  orderBy: { createdAt: 'DESC' }
});
```

### 캐싱 전략
```typescript
// Redis 캐싱
@Injectable()
export class UserService {
  @CacheKey('user:profile')
  @CacheTTL(300)
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.userRepository.findProfile(userId);
  }
}
```

## 로깅 및 모니터링

### 구조화된 로깅
```typescript
// 컨텍스트 정보 포함
this.logger.log('User created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
  correlationId: request.correlationId,
});
```

### 에러 추적
```typescript
// 상세한 에러 정보
this.logger.error('Database query failed', {
  query: 'SELECT * FROM users',
  error: error.message,
  stack: error.stack,
  correlationId: request.correlationId,
});
```

## 배포 및 운영

### Docker 구성
```dockerfile
# 멀티 스테이지 빌드
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
```

### 환경 설정
```typescript
// 환경별 설정 분리
const config = {
  development: {
    database: {
      host: 'localhost',
      port: 5432,
    },
  },
  production: {
    database: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
    },
  },
};
```

## 커밋 컨벤션

### 커밋 메시지 형식
```
type(scope): description

feat(auth): add user authentication
fix(api): resolve user creation bug
docs(readme): update installation guide
refactor(user): extract user service
test(auth): add login integration tests
```

### 브랜치 전략
```
main          # 프로덕션 브랜치
develop       # 개발 브랜치
feature/*     # 기능 브랜치
hotfix/*      # 핫픽스 브랜치
```

## 코드 리뷰 체크리스트

### 필수 확인 사항
- [ ] 타입 안정성 확보
- [ ] 예외 처리 적절성
- [ ] 성능 최적화 (N+1 문제 등)
- [ ] 보안 취약점 검토
- [ ] 테스트 코드 작성
- [ ] 문서화 완료

### 품질 기준
- [ ] 코드 복잡도 관리
- [ ] 의존성 주입 적절성
- [ ] 단일 책임 원칙 준수
- [ ] 재사용성 고려
- [ ] 가독성 및 유지보수성

# SignalSpot 프론트엔드 개발 가이드라인

## Expo 우선 라이브러리 선택 규칙
- **Expo SDK 우선**: 네이티브 기능은 항상 Expo SDK 패키지 우선 사용
- **호환성 검증**: `npx expo install` 명령으로 호환 버전 확인 후 설치  
- **네이티브 모듈 회피**: react-native-* 패키지보다 expo-* 패키지 우선
- **공식 문서 확인**: Expo 공식 문서에서 지원하는 라이브러리 우선 선택

### 라이브러리 선택 가이드
```typescript
// ✅ 올바른 선택
import * as Location from 'expo-location';
import { ExpoMap } from 'expo-maps';  
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

// ❌ 피해야 할 선택
import { RNLocation } from 'react-native-location';
import MapView from 'react-native-maps';
import ImagePicker from 'react-native-image-picker';
```

## AI 할루시네이션 방지 및 유지보수성 향상

### 1. 명시적 타입 정의
```typescript
// ✅ 명확한 타입 정의
interface UserProfile {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ❌ 모호한 타입
interface User {
  [key: string]: any;
}
```

### 2. 파일 구조 표준화
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Button, Input 등)
│   ├── forms/          # 폼 관련 컴포넌트
│   └── ui/             # UI 컴포넌트
├── screens/            # 화면 컴포넌트
│   ├── auth/           # 인증 관련 화면
│   ├── main/           # 메인 탭 화면
│   └── modals/         # 모달 화면
├── services/           # API 서비스
├── contexts/           # React Context
├── hooks/              # 커스텀 훅
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입 정의
├── constants/          # 상수 정의
└── navigation/         # 네비게이션 설정
```

### 3. 컴포넌트 표준 구조
```typescript
// 컴포넌트 파일 표준 구조
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

// 1. 타입 정의
interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

// 2. 메인 컴포넌트
export const CustomButton: React.FC<Props> = ({ 
  title, 
  onPress, 
  disabled = false 
}) => {
  // 3. 상태 관리
  const [loading, setLoading] = useState(false);

  // 4. 콜백 함수
  const handlePress = useCallback(async () => {
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  }, [onPress]);

  // 5. 메모이제이션
  const buttonStyle = useMemo(() => [
    styles.button,
    disabled && styles.disabled
  ], [disabled]);

  // 6. JSX 반환
  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={handlePress}
        loading={loading}
        disabled={disabled || loading}
        style={buttonStyle}
      >
        {title}
      </Button>
    </View>
  );
};

// 7. 스타일 정의
const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    paddingVertical: 6,
  },
  disabled: {
    opacity: 0.6,
  },
});
```

### 4. 컴포넌트 중앙화 관리 규칙

#### 컴포넌트 계층 구조
```
src/components/
├── common/           # 공통 기본 컴포넌트
│   ├── Button/
│   │   ├── index.ts
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   └── Button.styles.ts
│   ├── Input/
│   ├── Modal/
│   └── index.ts     # 배럴 익스포트
├── forms/           # 폼 관련 컴포넌트
│   ├── LoginForm/
│   ├── RegisterForm/
│   └── index.ts
├── ui/              # UI 전용 컴포넌트
│   ├── Avatar/
│   ├── Badge/
│   ├── Card/
│   └── index.ts
└── layout/          # 레이아웃 컴포넌트
    ├── Header/
    ├── TabBar/
    └── index.ts
```

#### 컴포넌트 생성 규칙

1. **새 컴포넌트 생성시**:
```typescript
// ❌ 직접 스크린에서 인라인 컴포넌트 생성
const FeedScreen = () => {
  return (
    <View>
      <View style={{ padding: 16, backgroundColor: 'white' }}>
        <Text>Signal Card</Text>
      </View>
    </View>
  );
};

// ✅ 공통 컴포넌트로 분리
// src/components/ui/SignalCard/SignalCard.tsx
export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text variant="titleMedium">{signal.title}</Text>
        <Text variant="bodyMedium">{signal.content}</Text>
      </Card.Content>
    </Card>
  );
};

// 스크린에서 사용
import { SignalCard } from '../../components/ui';
```

2. **컴포넌트 분류 기준**:
```typescript
// common/ - 범용적이고 재사용성이 높은 기본 컴포넌트
export const Button: React.FC<ButtonProps> = ({ variant, size, children, ...props }) => {
  // Material Design 기반 버튼
};

// ui/ - 도메인 특화된 UI 컴포넌트
export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  // Signal 도메인에 특화된 카드
};

// forms/ - 폼 관련 복합 컴포넌트
export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  // 로그인 폼 전체 로직 포함
};

// layout/ - 레이아웃 관련 컴포넌트
export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children }) => {
  // 화면 공통 레이아웃
};
```

3. **컴포넌트 파일 구조**:
```typescript
// Button/index.ts - 배럴 익스포트
export { Button } from './Button';
export type { ButtonProps } from './Button.types';

// Button/Button.types.ts - 타입 정의
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

// Button/Button.styles.ts - 스타일 분리
export const createButtonStyles = (variant: string, size: string) => 
  StyleSheet.create({
    button: {
      // 동적 스타일 로직
    },
  });

// Button/Button.tsx - 메인 컴포넌트
export const Button: React.FC<ButtonProps> = (props) => {
  // 컴포넌트 로직
};
```

4. **컴포넌트 재사용 규칙**:
```typescript
// ❌ 중복 컴포넌트 생성
const FeedScreen = () => {
  return (
    <TouchableOpacity style={primaryButtonStyle}>
      <Text>Post Signal</Text>
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  return (
    <TouchableOpacity style={primaryButtonStyle}>
      <Text>Edit Profile</Text>
    </TouchableOpacity>
  );
};

// ✅ 공통 컴포넌트 재사용
import { Button } from '../components/common';

const FeedScreen = () => {
  return (
    <Button variant="primary" onPress={handlePostSignal}>
      Post Signal
    </Button>
  );
};

const ProfileScreen = () => {
  return (
    <Button variant="primary" onPress={handleEditProfile}>
      Edit Profile
    </Button>
  );
};
```

5. **Props 디자인 패턴**:
```typescript
// ✅ 확장 가능한 Props 설계
interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
}

interface ButtonProps extends BaseButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  // React Native TouchableOpacity props 확장
  style?: ViewStyle;
  testID?: string;
}

// ✅ 조건부 Props (discriminated unions)
type IconButtonProps = 
  | { icon: string; children?: never }
  | { children: React.ReactNode; icon?: never };
```

6. **컴포넌트 성능 최적화**:
```typescript
// ✅ React.memo 사용
export const SignalCard = React.memo<SignalCardProps>(({ signal, onLike }) => {
  const handleLike = useCallback(() => {
    onLike(signal.id);
  }, [signal.id, onLike]);

  return (
    <Card>
      <Button onPress={handleLike}>Like</Button>
    </Card>
  );
});

// ✅ 컴포넌트 분할
const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  return (
    <Card>
      <SignalCardHeader signal={signal} />
      <SignalCardContent signal={signal} />
      <SignalCardActions signal={signal} />
    </Card>
  );
};
```

7. **컴포넌트 문서화**:
```typescript
/**
 * Primary button component based on Material Design
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="primary" 
 *   size="large"
 *   onPress={() => console.log('pressed')}
 * >
 *   Click me
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  onPress,
  children,
  ...props 
}) => {
  // 컴포넌트 구현
};
```

8. **중앙화 익스포트 관리**:
```typescript
// src/components/index.ts - 전체 컴포넌트 익스포트
export * from './common';
export * from './ui';
export * from './forms';
export * from './layout';

// src/components/common/index.ts - 카테고리별 익스포트
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { LoadingSpinner } from './LoadingSpinner';

// 사용시
import { Button, Input, SignalCard, LoginForm } from '../components';
```

#### 컴포넌트 생성 체크리스트
- [ ] 기존 컴포넌트로 해결 가능한지 확인
- [ ] 적절한 카테고리 (common/ui/forms/layout) 선택
- [ ] Props 타입 정의 및 기본값 설정
- [ ] 재사용성을 고려한 설계
- [ ] 성능 최적화 (React.memo, useCallback 등)
- [ ] 스타일 분리 (필요시)
- [ ] 배럴 익스포트 업데이트
- [ ] 문서화 주석 작성

## 리팩토링 및 클린코드 규칙

### 1. 함수 분리 원칙
```typescript
// ✅ 단일 책임 원칙
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

const validateForm = (email: string, password: string): string[] => {
  const errors: string[] = [];
  
  if (!validateEmail(email)) {
    errors.push('Invalid email format');
  }
  
  if (!validatePassword(password)) {
    errors.push('Password must be at least 8 characters with uppercase and number');
  }
  
  return errors;
};
```

### 2. 커스텀 훅 활용
```typescript
// ✅ 비즈니스 로직을 커스텀 훅으로 분리
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return { user, loading, login, logout };
};
```

### 3. 상수 및 설정 분리
```typescript
// constants/api.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  SIGNALS: {
    LIST: '/signals',
    CREATE: '/signals',
    LIKE: (id: string) => `/signals/${id}/like`,
  },
} as const;

// constants/ui.ts
export const COLORS = {
  PRIMARY: '#6200EE',
  SECONDARY: '#03DAC6',
  SURFACE: '#FFFFFF',
  BACKGROUND: '#F5F5F5',
  ERROR: '#B00020',
} as const;
```

### 4. 에러 처리 표준화
```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any): AppError => {
  if (error.response) {
    return new AppError(
      error.response.data.message || 'An error occurred',
      error.response.data.code || 'UNKNOWN_ERROR',
      error.response.status
    );
  }
  
  if (error.request) {
    return new AppError(
      'Network error',
      'NETWORK_ERROR',
      0
    );
  }
  
  return new AppError(
    error.message || 'Unknown error',
    'UNKNOWN_ERROR'
  );
};
```

### 5. 성능 최적화 패턴
```typescript
// ✅ 메모이제이션 활용
const SignalList: React.FC<{ signals: Signal[] }> = ({ signals }) => {
  const memoizedSignals = useMemo(() => 
    signals.filter(signal => signal.isActive)
  , [signals]);

  const renderSignal = useCallback((signal: Signal) => (
    <SignalItem key={signal.id} signal={signal} />
  ), []);

  return (
    <FlatList
      data={memoizedSignals}
      renderItem={({ item }) => renderSignal(item)}
      keyExtractor={(item) => item.id}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};
```

## UI 라이브러리 우선순위
1. **React Native Paper** (Material Design 기반)
2. **React Native Elements** (범용 컴포넌트)
3. **Expo 공식 컴포넌트**
4. **커스텀 컴포넌트** (필요시에만)

## 테스트 전략
```typescript
// ✅ 커스텀 훅 테스트
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.user).toBeDefined();
  });
});

// ✅ 컴포넌트 테스트
import { render, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';

describe('LoginScreen', () => {
  it('should show validation error for invalid email', () => {
    const { getByText, getByTestId } = render(<LoginScreen />);
    
    fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
    fireEvent.press(getByText('Login'));
    
    expect(getByText('Invalid email format')).toBeDefined();
  });
});
```

## 메모리 및 지식 관리 규칙
```typescript
// 프로젝트 구조 메모리 저장
interface ProjectStructure {
  screens: string[];
  services: string[];
  components: string[];
  hooks: string[];
  lastUpdated: Date;
}

// API 엔드포인트 메모리 저장
interface APIEndpoints {
  baseURL: string;
  endpoints: Record<string, string>;
  authRequired: string[];
}

// 버그 및 해결책 메모리 저장
interface BugFix {
  issue: string;
  solution: string;
  files: string[];
  dateFixed: Date;
}
```

## JWT 토큰 관리 및 Interceptor 가이드라인

### 토큰 관리 정책
- **Access Token**: 15분 만료 (보안성 우선)
- **Refresh Token**: 7일 만료 (사용성 고려)
- **자동 갱신**: Access Token 만료 시 자동으로 Refresh Token 사용
- **재로그인 기준**: Refresh Token 만료 시에만 로그인 화면으로 이동

### Axios Interceptor 표준 구현
```typescript
// services/api.ts
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://api.signalspot.com';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 중복 방지를 위한 변수
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request Interceptor
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Refresh Token으로 새 Access Token 요청
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken } = response.data;
        
        // 새 토큰 저장
        await AsyncStorage.setItem('accessToken', newAccessToken);
        
        // 대기 중인 요청들 처리
        processQueue(null, newAccessToken);
        
        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh Token도 만료된 경우
        processQueue(refreshError, null);
        
        // 모든 토큰 정보 삭제
        await AsyncStorage.multiRemove([
          'accessToken', 
          'refreshToken', 
          'user'
        ]);
        
        // 전역 이벤트 발생 (로그인 화면으로 이동)
        EventBus.emit('auth:logout');
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### EventBus 구현 (토큰 만료 알림용)
```typescript
// utils/eventBus.ts
class EventBusClass {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

export const EventBus = new EventBusClass();
```

### AuthContext 업데이트 (EventBus 연동)
```typescript
// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';
import { EventBus } from '../utils/eventBus';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      const isAuth = await authService.isAuthenticated();
      
      if (currentUser && isAuth) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  };

  const register = async (email: string, password: string, username: string) => {
    const response = await authService.register(email, password, username);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // 토큰 만료 시 자동 로그아웃 이벤트 리스너
    const handleAuthLogout = () => {
      setUser(null);
    };

    EventBus.on('auth:logout', handleAuthLogout);

    return () => {
      EventBus.off('auth:logout', handleAuthLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 토큰 상태 모니터링 훅
```typescript
// hooks/useTokenStatus.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface TokenStatus {
  isValid: boolean;
  expiresIn: number; // 남은 시간 (초)
  shouldRefresh: boolean; // 5분 이내 만료 시 true
}

export const useTokenStatus = () => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    isValid: false,
    expiresIn: 0,
    shouldRefresh: false,
  });

  const checkTokenStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        setTokenStatus({
          isValid: false,
          expiresIn: 0,
          shouldRefresh: false,
        });
        return;
      }

      const decoded: { exp: number } = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const expiresIn = decoded.exp - currentTime;
      
      setTokenStatus({
        isValid: expiresIn > 0,
        expiresIn: Math.max(0, expiresIn),
        shouldRefresh: expiresIn < 300, // 5분 이내
      });
    } catch (error) {
      console.error('Token status check failed:', error);
      setTokenStatus({
        isValid: false,
        expiresIn: 0,
        shouldRefresh: false,
      });
    }
  };

  useEffect(() => {
    checkTokenStatus();
    
    // 1분마다 토큰 상태 확인
    const interval = setInterval(checkTokenStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { tokenStatus, checkTokenStatus };
};
```

### API 요청 시 에러 처리 표준
```typescript
// hooks/useApiCall.ts
import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApiCall = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, execute };
};

const getErrorMessage = (error: any): string => {
  if (error.response) {
    // 서버 응답 에러
    switch (error.response.status) {
      case 400:
        return error.response.data?.message || '잘못된 요청입니다.';
      case 401:
        return '인증이 필요합니다.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 500:
        return '서버 오류가 발생했습니다.';
      default:
        return error.response.data?.message || '알 수 없는 오류가 발생했습니다.';
    }
  } else if (error.request) {
    // 네트워크 에러
    return '네트워크 연결을 확인해주세요.';
  } else {
    // 기타 에러
    return error.message || '오류가 발생했습니다.';
  }
};
```

### 사용 예시
```typescript
// screens/main/FeedScreen.tsx 일부
import { useApiCall } from '../../hooks/useApiCall';
import { signalService } from '../../services/signal';

const FeedScreen: React.FC = () => {
  const { data: signals, loading, error, execute } = useApiCall<Signal[]>();

  const loadSignals = useCallback(async () => {
    try {
      await execute(() => signalService.getFeedSignals());
    } catch (error) {
      // 에러는 useApiCall에서 처리됨
      console.error('Failed to load signals');
    }
  }, [execute]);

  useEffect(() => {
    loadSignals();
  }, [loadSignals]);

  // UI 렌더링...
};
```

### 토큰 관리 정책 요약
1. **자동 갱신**: 401 에러 발생 시 자동으로 refresh token 사용
2. **중복 방지**: 동시에 여러 요청이 401을 받아도 한 번만 갱신
3. **대기열 관리**: 갱신 중인 동안 다른 요청들은 대기 후 재시도
4. **완전 만료**: Refresh token까지 만료 시에만 로그인 화면으로 이동
5. **상태 동기화**: EventBus를 통한 전역 상태 관리

## Serena MCP 활용 체크리스트