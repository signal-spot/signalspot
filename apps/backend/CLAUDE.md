# SignalSpot 백엔드 개발 가이드라인

Claude Code를 위한 SignalSpot 백엔드 프로젝트 개발 가이드라인입니다.

## 백엔드 코드 작업 규칙

### 코드 수정 가능
- **백엔드 코드 직접 수정 가능**: Claude Code는 백엔드 코드를 직접 수정할 수 있음
- **서비스 로직 구현**: 비즈니스 로직, 서비스, 리포지토리 구현 가능
- **데이터베이스 작업**: 엔티티, 마이그레이션, 쿼리 작성 가능
- **API 엔드포인트 구현**: 컨트롤러, DTO, 가드, 인터셉터 구현 가능

### 서버 실행 규칙
- **백엔드 서버 실행은 사용자가 직접 수행**: Claude Code는 서버를 종료하거나 재시작하지 않음
- **서버 실행 명령어 안내만 제공**: npm run start:dev, npm run dev 등의 명령어만 안내
- **포트 충돌 시 사용자에게 알림**: 서버 실행 관련 문제는 사용자가 해결
- **절대 Bash로 서버 실행/재시작 금지**: pm2, nodemon, node 등으로 서버를 실행하지 않음

## 필수 도구 사용 규칙

### Serena MCP 우선 사용
- **모든 코드 작업은 Serena MCP 우선**: 파일 읽기, 쓰기, 검색, 수정 등 모든 작업
- **심볼 기반 작업**: `find_symbol`, `replace_symbol_body`, `insert_after_symbol` 등 적극 활용
- **패턴 검색**: `search_for_pattern`으로 코드 패턴 및 문제점 찾기
- **메모리 관리**: `write_memory`, `read_memory`로 프로젝트 지식 저장 및 활용
- **코드 분석**: `get_symbols_overview`로 코드베이스 구조 파악
- **참조 분석**: `find_referencing_symbols`로 의존성 및 사용처 파악

## 프로젝트 구조

```
apps/backend/
├── src/
│   ├── app/             # 애플리케이션 모듈
│   ├── auth/            # 인증 모듈
│   ├── chat/            # 채팅 모듈
│   ├── common/          # 공통 모듈 (가드, 인터셉터, 파이프)
│   ├── config/          # 설정 모듈
│   ├── database/        # 데이터베이스 설정
│   ├── domain/          # 도메인 서비스
│   ├── entities/        # 엔티티 정의
│   ├── feed/            # 피드 모듈
│   ├── health/          # 헬스체크 모듈
│   ├── location/        # 위치 모듈
│   ├── notification/    # 알림 모듈 (Push)
│   ├── notifications/   # 알림 모듈 (일반)
│   ├── profile/         # 프로필 모듈
│   ├── report/          # 신고 모듈
│   ├── repositories/    # 리포지토리
│   ├── sacred-site/     # 성지 모듈
│   ├── signal-spot/     # 시그널 스팟 모듈
│   ├── spark/           # 스파크 모듈
│   ├── upload/          # 파일 업로드 모듈
│   ├── user/            # 사용자 모듈
│   ├── websocket/       # 웹소켓 모듈
│   └── main.ts          # 진입점
├── migrations/          # 데이터베이스 마이그레이션
├── test/               # 테스트 파일
└── mikro-orm.config.ts # MikroORM 설정
```

## 개발 환경 설정

### 필수 도구
- Node.js 18+
- PostgreSQL 14+ (PostGIS 확장 필요)
- Redis (캐싱용)
- Docker & Docker Compose (선택사항)

### 개발 서버 실행
```bash
# 백엔드 개발 서버
npm run start:dev

# 또는 ts-node-dev 사용
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

## 코딩 표준

### NestJS 모듈 구조
```typescript
@Module({
  imports: [
    MikroOrmModule.forFeature([User, UserProfile]),
    CommonModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

### 서비스 계층 패턴
```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(dto);
    this.eventEmitter.emit('user.created', user);
    return user;
  }
}
```

### 컨트롤러 패턴
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, VerifiedUserGuard)
@UseInterceptors(ErrorHandlingInterceptor, ResponseTransformInterceptor)
@ApiBearerAuth()
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.createUser(dto);
  }
}
```

## 도메인 주도 설계 (DDD) 원칙

### 엔티티 설계
```typescript
@Entity()
export class User extends BaseEntity {
  @PrimaryKey()
  id: string = v4();

  @Property({ unique: true })
  email: string;

  @Property()
  username: string;

  @Embedded(() => UserProfile)
  profile: UserProfile;

  @OneToMany(() => SignalSpot, spot => spot.creator)
  spots = new Collection<SignalSpot>(this);
}
```

### 값 객체 (Value Objects)
```typescript
@Embeddable()
export class Coordinates {
  @Property()
  latitude: number;

  @Property()
  longitude: number;

  static create(lat: number, lng: number): Coordinates {
    if (lat < -90 || lat > 90) {
      throw new Error('Invalid latitude');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Invalid longitude');
    }
    const coords = new Coordinates();
    coords.latitude = lat;
    coords.longitude = lng;
    return coords;
  }
}
```

### Repository 패턴
```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: EntityRepository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ id });
  }

  async save(user: User): Promise<User> {
    await this.repository.persistAndFlush(user);
    return user;
  }
}
```

## API 표준화

### 응답 구조
```typescript
// 성공 응답
{
  success: true,
  data: T | T[],
  message: string,
  count?: number,    // 리스트인 경우
  metadata?: {
    requestId: string,
    responseTime: string
  }
}

// 에러 응답
{
  success: false,
  statusCode: number,
  message: string,
  error?: string,
  timestamp: string,
  path: string
}
```

### 인터셉터와 필터

#### 응답 변환 인터셉터
```typescript
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        message: 'Success',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

#### 전역 예외 필터
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## 데이터베이스 관리

### MikroORM 설정
```typescript
export default defineConfig({
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_DATABASE || 'signalspot',
  entities: [/* 엔티티 목록 */],
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
});
```

### 마이그레이션
```bash
# 마이그레이션 생성
npx mikro-orm migration:create

# 마이그레이션 실행
npx mikro-orm migration:up

# 마이그레이션 롤백
npx mikro-orm migration:down

# 스키마 업데이트 (개발용)
npx mikro-orm schema:update --run
```

## 보안 및 인증

### JWT 인증
- Access Token: 15분
- Refresh Token: 7일
- Guard: `JwtAuthGuard`
- Strategy: `JwtStrategy`

### 권한 검증
- `VerifiedUserGuard`: 인증된 사용자만
- `AdminGuard`: 관리자만
- `RateLimitGuard`: 요청 제한

### Rate Limiting
```typescript
@UseGuards(RateLimitGuard)
@RateLimit({ max: 10, windowMs: 60 * 1000 }) // 분당 10회
```

## 테스트

### 단위 테스트
```bash
npm run test
npm run test:watch
npm run test:cov
```

### E2E 테스트
```bash
npm run test:e2e
```

## 환경변수 (.env)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=signalspot

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={}

# Server
PORT=3000
NODE_ENV=development
```

## 중요 작업 규칙

### 절대 하지 말아야 할 행동
- ❌ **서버 실행/재시작 금지**: Bash로 npm run start, pm2, node, nodemon 등 실행 금지
- ❌ **포트 프로세스 종료 금지**: kill, pkill, lsof 등으로 포트 관련 프로세스 종료 금지  
- ❌ **package.json 스크립트 실행 금지**: npm run dev, npm run start:dev 등 직접 실행 금지
- ❌ **백그라운드 프로세스 생성 금지**: nohup, &, screen, tmux 등 사용 금지

### 올바른 행동
- ✅ **코드 수정만 수행**: 서비스, 컨트롤러, 엔티티 등 코드만 수정
- ✅ **명령어 안내만 제공**: 사용자가 실행할 명령어를 텍스트로만 안내
- ✅ **빌드/린트 검증만 수행**: npm run build, npm run lint는 실행 가능
- ✅ **테스트만 실행**: npm run test는 실행 가능

## 코드 검증 체크리스트

### 필수 검증 사항
- [ ] TypeScript 컴파일 에러 확인 (`npx tsc --noEmit`)
- [ ] ESLint 에러 확인 (`npm run lint`)
- [ ] 빌드 성공 여부 확인 (`npm run build`)
- [ ] 테스트 통과 여부 확인 (`npm run test`)

### 코드 품질
- [ ] 에러 핸들링 구현
- [ ] DTO 검증 구현
- [ ] 트랜잭션 처리
- [ ] 로깅 구현
- [ ] API 문서화 (Swagger)

### 보안
- [ ] 인증/인가 구현
- [ ] SQL Injection 방지
- [ ] XSS 방지
- [ ] Rate Limiting 적용
- [ ] 민감 정보 환경변수 처리

## Serena MCP 활용 체크리스트

### 코드 분석
- [ ] `get_symbols_overview`로 모듈 구조 파악
- [ ] `find_symbol`로 특정 서비스/컨트롤러 찾기
- [ ] `search_for_pattern`으로 TODO, FIXME 검색
- [ ] `find_referencing_symbols`로 의존성 파악

### 코드 수정
- [ ] `replace_symbol_body`로 메서드 구현
- [ ] `insert_after_symbol`로 새 메서드 추가
- [ ] `replace_regex`로 부분 수정

### 메모리 관리
- [ ] `write_memory`로 API 스펙 저장
- [ ] `read_memory`로 도메인 지식 활용
- [ ] `list_memories`로 저장된 정보 확인

### 작업 완료
- [ ] `think_about_task_adherence`로 요구사항 확인
- [ ] `think_about_whether_you_are_done`로 완료 검증