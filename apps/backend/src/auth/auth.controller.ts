import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import { 
  RegisterDto, 
  LoginDto, 
  RefreshTokenDto, 
  EmailVerificationDto, 
  ResendVerificationDto 
} from './dto/auth.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { RateLimitGuard, RateLimit } from '../common/guards/rate-limit.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 5, windowMs: 60 * 1000 }) // 5 requests per minute
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered'
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @ApiResponse({ status: 429, description: 'Too many registration attempts' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 login attempts per minute
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in'
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('phone/check')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 requests per minute
  @ApiOperation({ summary: 'Check if phone number is already registered' })
  @ApiResponse({ 
    status: 200, 
    description: 'Phone number check result',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async checkPhoneNumber(@Body() checkPhoneDto: { phoneNumber: string }): Promise<{ exists: boolean; message: string }> {
    const exists = await this.authService.checkPhoneExists(checkPhoneDto.phoneNumber);
    return {
      exists,
      message: exists ? 'Phone number is already registered' : 'Phone number is available'
    };
  }

  @Post('phone/authenticate')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 5, windowMs: 60 * 1000 }) // 5 requests per minute
  @ApiOperation({ summary: 'Authenticate with phone number (after Firebase verification)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Phone authentication successful' 
  })
  @ApiResponse({ status: 400, description: 'Invalid phone number or Firebase token' })
  @ApiResponse({ status: 401, description: 'Firebase token verification failed' })
  @ApiResponse({ status: 429, description: 'Too many authentication attempts' })
  async authenticateWithPhone(@Body() phoneAuthDto: {
    phoneNumber: string;
    firebaseToken: string;
    userData?: {
      username?: string;
      firstName?: string;
      lastName?: string;
    };
  }): Promise<AuthResponse & { profileCompleted: boolean }> {
    // Firebase 토큰 검증은 AuthService에서 처리
    return this.authService.authenticateWithPhoneAndFirebase(
      phoneAuthDto.phoneNumber, 
      phoneAuthDto.firebaseToken,
      phoneAuthDto.userData
    );
  }

  // Remove the old SMS verification method - we'll use Firebase instead

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 20, windowMs: 60 * 1000 }) // 20 refresh attempts per minute
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token successfully refreshed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiResponse({ status: 429, description: 'Too many refresh attempts' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ success: boolean; data: { accessToken: string; refreshToken: string } }> {
    const tokens = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return {
      success: true,
      data: tokens
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  async logout(
    @GetUser() user: User,
    @Body() body?: { platform?: 'fcm' | 'apns' }
  ): Promise<{ message: string }> {
    await this.authService.logout(user.id, body?.platform);
    return { message: 'Successfully logged out' };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        firstName: { type: 'string', nullable: true },
        lastName: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
        profileCompleted: { type: 'boolean' }
      }
    }
  })
  async getProfile(@GetUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      profileCompleted: user.profileCompleted,
    };
  }

  @Post('send-verification')
  @UseGuards(AuthGuard('jwt'), RateLimitGuard)
  @RateLimit({ max: 3, windowMs: 60 * 1000 }) // 3 requests per minute
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Email already verified or user not found' })
  @ApiResponse({ status: 429, description: 'Too many verification requests' })
  async sendEmailVerification(@GetUser() user: User): Promise<{ message: string }> {
    await this.authService.sendEmailVerification(user.id);
    return { message: 'Verification email sent successfully' };
  }

  @Post('verify-email')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 5, windowMs: 60 * 1000 }) // 5 attempts per minute
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 429, description: 'Too many verification attempts' })
  async verifyEmail(@Body() emailVerificationDto: EmailVerificationDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(emailVerificationDto.token);
  }

  @Post('resend-verification')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 3, windowMs: 60 * 1000 }) // 3 requests per minute
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent if email exists' })
  @ApiResponse({ status: 429, description: 'Too many resend attempts' })
  async resendEmailVerification(@Body() resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    return this.authService.resendEmailVerification(resendVerificationDto.email);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for auth service' })
  @ApiResponse({ status: 200, description: 'Auth service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      service: 'auth',
      timestamp: new Date().toISOString(),
    };
  }

  // Account deletion endpoints
  @Delete('account')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user account (soft delete)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Account successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        recoveryToken: { type: 'string' },
        recoveryExpiresAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Account already deleted' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  async deleteAccount(
    @GetUser() user: User,
    @Body() body?: { password?: string }
  ): Promise<{ 
    message: string; 
    recoveryToken: string;
    recoveryExpiresAt: Date;
  }> {
    return this.authService.deleteAccount(user.id, body?.password);
  }

  @Post('account/recover')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 5, windowMs: 60 * 1000 }) // 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recover deleted account' })
  @ApiResponse({ 
    status: 200, 
    description: 'Account successfully recovered',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid recovery token or expired' })
  @ApiResponse({ status: 429, description: 'Too many recovery attempts' })
  async recoverAccount(
    @Body() body: { recoveryToken: string; email: string }
  ): Promise<{
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
    };
  }> {
    return this.authService.recoverAccount(body.recoveryToken, body.email);
  }

  @Post('account/recovery-status')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check recovery token status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recovery status retrieved',
    schema: {
      type: 'object',
      properties: {
        canRecover: { type: 'boolean' },
        expiresAt: { type: 'string', format: 'date-time', nullable: true },
        message: { type: 'string' }
      }
    }
  })
  async checkRecoveryStatus(
    @Body() body: { recoveryToken: string }
  ): Promise<{
    canRecover: boolean;
    expiresAt?: Date;
    message: string;
  }> {
    return this.authService.checkRecoveryStatus(body.recoveryToken);
  }
} 