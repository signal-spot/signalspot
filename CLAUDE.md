# SignalSpot 개발 가이드라인

Claude Code를 위한 SignalSpot 프로젝트 개발 가이드라인입니다.

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