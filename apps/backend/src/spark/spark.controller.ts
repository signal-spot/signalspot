import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  Logger,
  HttpStatus,
  HttpCode,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody, ApiProperty
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { RateLimitGuard, RateLimit } from '../common/guards/rate-limit.guard';
import { ErrorHandlingInterceptor } from '../common/interceptors/error-handling.interceptor';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { SparkDetectionService } from './services/spark-detection.service';
import { SparkStatus, SparkType } from './entities/spark.entity';


class SendSparkDto {
  @ApiProperty({ description: 'Target user ID' })
  @IsUUID()
  user2Id: string;

  @ApiProperty({ description: 'Optional message', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Type of spark',
    enum: ['interest', 'like', 'meet', 'comment'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sparkType?: string;

  @ApiProperty({ description: 'Related spot ID', required: false })
  @IsOptional()
  @IsUUID()
  spotId?: string;
}

class SparkResponseDto {
  id: string;
  user1Id: string;
  user2Id: string;
  otherUserId: string; // 상대방의 ID
  otherUserNickname: string; // 상대방의 닉네임
  otherUserAvatar?: string; // 상대방의 아바타 URL
  type: SparkType;
  status: SparkStatus;
  createdAt: Date;
  message?: string;
  direction?: 'sent' | 'received'; // 내가 보낸 것인지 받은 것인지
  latitude?: number; // 스파크 발생 위치 위도
  longitude?: number; // 스파크 발생 위치 경도
  distance?: number; // 사용자 간 거리 (미터)
  metadata?: any; // 추가 메타데이터
  user1Accepted?: boolean; // user1이 수락했는지
  user2Accepted?: boolean; // user2가 수락했는지
  myAccepted?: boolean; // 현재 사용자가 수락했는지
  otherAccepted?: boolean; // 상대방이 수락했는지
}

@ApiTags('Sparks')
@Controller('sparks')
@UseGuards(JwtAuthGuard, VerifiedUserGuard, RateLimitGuard)
@UseInterceptors(ErrorHandlingInterceptor, ResponseTransformInterceptor)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ 
  transform: true, 
  whitelist: true, 
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
}))
@RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
export class SparkController {
  private readonly logger = new Logger(SparkController.name);

  constructor(private readonly sparkDetectionService: SparkDetectionService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user sparks',
    description: 'Retrieves all sparks for the authenticated user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sparks retrieved successfully',
    type: [SparkResponseDto]
  })
  async getUserSparks(@GetUser() user: User): Promise<{success: boolean, data: SparkResponseDto[]}> {
    try {
      this.logger.log(`Getting sparks for user ${user.id}`);
      
      const sparks = await this.sparkDetectionService.getUserSparks(user.id);
      
      const sparkData: SparkResponseDto[] = await Promise.all(sparks.map(async spark => {
        const isUser1 = spark.user1.id === user.id;
        const otherUserRef = isUser1 ? spark.user2 : spark.user1;
        const direction: 'sent' | 'received' = isUser1 ? 'sent' : 'received';
        
        // Ensure user is loaded
        const otherUser = await otherUserRef.load();

        return {
          id: spark.id,
          user1Id: spark.user1.id,
          user2Id: spark.user2.id,
          otherUserId: otherUser.id,
          otherUserNickname: otherUser.username || '익명',
          otherUserAvatar: otherUser.avatarUrl || null,
          type: spark.type,
          status: spark.status,
          createdAt: spark.createdAt,
          message: spark.message || '',
          direction,
          latitude: spark.latitude,
          longitude: spark.longitude,
          distance: spark.distance,
          metadata: spark.metadata,
          user1Accepted: spark.user1Accepted,
          user2Accepted: spark.user2Accepted,
          myAccepted: isUser1 ? spark.user1Accepted : spark.user2Accepted,
          otherAccepted: isUser1 ? spark.user2Accepted : spark.user1Accepted,
        };
      }));

      this.logger.log(`Found ${sparks.length} sparks for user`);

      return {
        success: true,
        data: sparkData,
      };
    } catch (error) {
      this.logger.error(`Failed to get user sparks: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get spark statistics',
    description: 'Retrieves spark statistics for the authenticated user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Spark statistics retrieved successfully'
  })
  async getSparkStats(@GetUser() user: User): Promise<{
    success: boolean, 
    data: {
      todaySparks: number;
      totalSparks: number;
      pendingSparks: number;
      acceptedSparks: number;
      rejectedSparks: number;
      thisWeekSparks: number;
    }
  }> {
    try {
      this.logger.log(`Getting spark stats for user ${user.id}`);
      
      const sparks = await this.sparkDetectionService.getUserSparks(user.id);
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const stats = {
        todaySparks: sparks.filter(s => s.createdAt >= startOfDay).length,
        totalSparks: sparks.length,
        pendingSparks: sparks.filter(s => s.status === SparkStatus.PENDING).length,
        acceptedSparks: sparks.filter(s => s.status === SparkStatus.ACCEPTED).length,
        rejectedSparks: sparks.filter(s => s.status === SparkStatus.REJECTED).length,
        thisWeekSparks: sparks.filter(s => s.createdAt >= startOfWeek).length,
      };

      this.logger.log(`Spark stats for user: ${JSON.stringify(stats)}`);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Failed to get spark stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get spark details',
    description: 'Retrieves detailed information about a specific spark.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the spark', 
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Spark details retrieved successfully'
  })
  async getSparkById(
    @Param('id') sparkId: string,
    @GetUser() user: User
  ): Promise<{success: boolean, data: any}> {
    try {
      this.logger.log(`Getting spark details for ${sparkId} by user ${user.id}`);
      
      const spark = await this.sparkDetectionService.getSparkById(sparkId);
      
      if (!spark) {
        this.logger.error(`Spark not found: ${sparkId}`);
        throw new NotFoundException('Spark not found');
      }
      
      this.logger.log(`Spark found: user1=${spark.user1.id}, user2=${spark.user2.id}`);
      
      // Check if user is part of this spark
      if (spark.user1.id !== user.id && spark.user2.id !== user.id) {
        this.logger.error(`User ${user.id} does not have access to spark ${sparkId}`);
        throw new ForbiddenException('You do not have access to this spark');
      }
      
      // Determine the other user
      const otherUserRef = spark.user1.id === user.id ? spark.user2 : spark.user1;
      const otherUser = await otherUserRef.load();
      
      this.logger.log(`Other user loaded: ${otherUser.username}, bio: ${otherUser.bio}, occupation: ${otherUser.occupation}`);
      
      // Calculate matching info
      const locationHistory = await this.sparkDetectionService.getLocationHistory(user.id, otherUser.id);
      const distance = locationHistory.length > 0 ? locationHistory[0].distance : null;
      
      // 실제 시그니처 커넥션 데이터 가져오기 (preferences.signatureConnection에서)
      const userSignature = user.preferences?.signatureConnection;
      const otherUserSignature = otherUser.preferences?.signatureConnection;
      
      const isMbtiMatch = userSignature?.mbti && otherUserSignature?.mbti && 
                         userSignature.mbti === otherUserSignature.mbti;
      
      // 매칭률 계산 (실제 데이터 기반)
      let matchingRate = 50; // 기본 점수
      if (isMbtiMatch) matchingRate += 15;
      
      // 시그니처 커넥션 필드들 비교
      if (userSignature?.memorablePlace && otherUserSignature?.memorablePlace) {
        matchingRate += 5;
      }
      if (userSignature?.turningPoint && otherUserSignature?.turningPoint) {
        matchingRate += 5;
      }
      if (userSignature?.bucketList && otherUserSignature?.bucketList) {
        matchingRate += 5;
      }
      
      // 관심사 비교
      const userInterests = user.interests || [];
      const otherInterests = otherUser.interests || [];
      const commonInterests = userInterests.filter(interest => 
        otherInterests.includes(interest)
      );
      
      if (commonInterests.length > 0) {
        matchingRate += Math.min(commonInterests.length * 5, 20); // 최대 20점 추가
      }
      
      matchingRate = Math.min(matchingRate, 100); // 최대 100점
      
      const sparkDetail = {
        id: spark.id,
        user1Id: spark.user1.id,
        user2Id: spark.user2.id,
        otherUserId: otherUser.id,
        otherUserNickname: otherUser.username || '익명',
        otherUserAvatar: otherUser.avatarUrl || null,
        type: spark.type,
        status: spark.status,
        createdAt: spark.createdAt,
        respondedAt: spark.user1ResponseAt || spark.user2ResponseAt || null,
        message: spark.message || '',
        direction: spark.user1.id === user.id ? 'sent' : 'received',
        expiresAt: spark.expiresAt || new Date(spark.createdAt.getTime() + 72 * 60 * 60 * 1000), // 72 hours
        
        // Location info
        location: spark.metadata?.location || '알 수 없는 위치',
        latitude: spark.latitude || null,
        longitude: spark.longitude || null,
        distance: distance || spark.distance || 0,
        time: spark.createdAt.toLocaleTimeString('ko-KR'),
        duration: spark.metadata?.duration ? 
          `약 ${Math.round((spark.metadata.duration as number) / 60)}분간 머물렀어요` : 
          '알 수 없음',
        
        // 실제 매칭 정보
        matchingRate: matchingRate,
        commonInterests: commonInterests.length > 0 ? commonInterests : ['아직 공통 관심사를 찾지 못했어요'],
        
        // 시그니처 커넥션 (실제 데이터)
        signatureConnection: {
          mbti: otherUserSignature?.mbti || null,
          memorablePlace: otherUserSignature?.memorablePlace || null,
          turningPoint: otherUserSignature?.turningPoint || null,
          bucketList: otherUserSignature?.bucketList || null,
          isMbtiMatch: isMbtiMatch,
          hasSignatureData: !!otherUserSignature,
        },
        
        // 추가 힌트 (실제 데이터 기반)
        additionalHints: [
          otherUser.occupation ? `직업: ${otherUser.occupation}` : null,
          otherUser.location ? `지역: ${otherUser.location}` : null,
          otherUser.bio ? `소개: ${otherUser.bio.substring(0, 50)}...` : null,
          otherUser.skills?.length ? `기술: ${otherUser.skills.slice(0, 3).join(', ')}` : null,
          otherUser.languages?.length ? `언어: ${otherUser.languages.slice(0, 3).join(', ')}` : null,
        ].filter(Boolean), // null 값 제거
        
        // Other user info (limited)
        otherUser: {
          id: otherUser.id,
          nickname: otherUser.username || '익명',
          avatarUrl: otherUser.avatarUrl || null,
          bio: otherUser.bio || null,
          occupation: otherUser.occupation || null,
          location: otherUser.location || null,
          interests: otherUser.interests || [],
          skills: otherUser.skills || [],
          languages: otherUser.languages || [],
        }
      };

      this.logger.log(`Spark detail retrieved successfully`);

      return {
        success: true,
        data: sparkDetail,
      };
    } catch (error) {
      this.logger.error(`Failed to get spark details: ${error.message}`, error.stack);
      throw error;
    }
  }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit to 5 spark creations per minute
    message: 'Too many sparks sent, please wait before sending another one.',
  })
  @ApiOperation({ 
    summary: 'Send a spark',
    description: 'Sends a spark to another user to initiate a connection.'
  })
  @ApiBody({ type: SendSparkDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Spark sent successfully',
    type: SparkResponseDto
  })
  async sendSpark(
    @Body() sendSparkDto: SendSparkDto,
    @GetUser() user: User
  ): Promise<{success: boolean, data: SparkResponseDto}> {
    try {
      this.logger.log(`User ${user.id} sending spark to ${sendSparkDto.user2Id}`);
      
      // Use the real spark detection service to send a manual spark
      const spark = await this.sparkDetectionService.sendManualSpark(
        user.id,
        sendSparkDto.user2Id,
        sendSparkDto.message,
        sendSparkDto.spotId
      );

      // 상대방 정보 가져오기
      const receiver = await spark.user2.load();
      
      const sparkData: SparkResponseDto = {
        id: spark.id,
        user1Id: spark.user1.id,
        user2Id: spark.user2.id,
        otherUserId: receiver.id,
        otherUserNickname: receiver.username || '익명',
        otherUserAvatar: receiver.avatarUrl || null,
        type: spark.type,
        status: spark.status,
        createdAt: spark.createdAt,
        message: spark.message || sendSparkDto.message || '',
        direction: 'sent', // 항상 내가 보낸 것
      };

      this.logger.log(`Spark sent successfully: ${spark.id}`);

      return {
        success: true,
        data: sparkData,
      };
    } catch (error) {
      this.logger.error(`Failed to send spark: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id/accept')
  @ApiOperation({ 
    summary: 'Accept a spark',
    description: 'Accepts a pending spark from another user.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the spark to accept', 
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Spark accepted successfully'
  })
  async acceptSpark(
    @Param('id', ParseUUIDPipe) sparkId: string,
    @GetUser() user: User
  ): Promise<{success: boolean, data: any}> {
    try {
      this.logger.log(`User ${user.id} accepting spark ${sparkId}`);
      
      const spark = await this.sparkDetectionService.respondToSpark(sparkId, user.id, true);
      
      this.logger.log(`Spark ${sparkId} accepted successfully`);

      return {
        success: true,
        data: spark
      };
    } catch (error) {
      this.logger.error(`Failed to accept spark ${sparkId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id/reject')
  @ApiOperation({ 
    summary: 'Reject a spark',
    description: 'Rejects a pending spark from another user.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the spark to reject', 
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Spark rejected successfully'
  })
  async rejectSpark(
    @Param('id', ParseUUIDPipe) sparkId: string,
    @GetUser() user: User
  ): Promise<{success: boolean, data: any}> {
    try {
      this.logger.log(`User ${user.id} rejecting spark ${sparkId}`);
      
      const spark = await this.sparkDetectionService.respondToSpark(sparkId, user.id, false);
      
      this.logger.log(`Spark ${sparkId} rejected successfully`);

      return {
        success: true,
        data: spark
      };
    } catch (error) {
      this.logger.error(`Failed to reject spark ${sparkId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}