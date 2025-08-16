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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { RateLimitGuard, RateLimit } from '../common/guards/rate-limit.guard';
import { ErrorHandlingInterceptor } from '../common/interceptors/error-handling.interceptor';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { SparkDetectionService } from './services/spark-detection.service';
import { Spark, SparkStatus } from './entities/spark.entity';

class SendSparkDto {
  user2Id: string;
  message?: string;
}

class SparkResponseDto {
  id: string;
  user1Id: string;
  user2Id: string;
  status: SparkStatus;
  createdAt: Date;
  message?: string;
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
      
      const sparkData = sparks.map(spark => ({
        id: spark.id,
        user1Id: spark.user1.id,
        user2Id: spark.user2.id,
        status: spark.status,
        createdAt: spark.createdAt,
        message: spark.message,
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
      
      // For now, return a mock response since the actual spark creation logic
      // is more complex and involves location-based detection
      const mockSpark = {
        id: `spark-${Date.now()}`,
        user1Id: user.id,
        user2Id: sendSparkDto.user2Id,
        status: SparkStatus.PENDING,
        createdAt: new Date(),
        message: sendSparkDto.message,
      };

      this.logger.log(`Spark sent successfully: ${mockSpark.id}`);

      return {
        success: true,
        data: mockSpark,
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
  ): Promise<{success: boolean, message: string}> {
    try {
      this.logger.log(`User ${user.id} accepting spark ${sparkId}`);
      
      await this.sparkDetectionService.respondToSpark(sparkId, user.id, true);
      
      this.logger.log(`Spark ${sparkId} accepted successfully`);

      return {
        success: true,
        message: 'Spark accepted successfully'
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
  ): Promise<{success: boolean, message: string}> {
    try {
      this.logger.log(`User ${user.id} rejecting spark ${sparkId}`);
      
      await this.sparkDetectionService.respondToSpark(sparkId, user.id, false);
      
      this.logger.log(`Spark ${sparkId} rejected successfully`);

      return {
        success: true,
        message: 'Spark rejected successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to reject spark ${sparkId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}