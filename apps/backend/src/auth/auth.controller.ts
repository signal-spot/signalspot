import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
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
        accessToken: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiResponse({ status: 429, description: 'Too many refresh attempts' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  async logout(@GetUser() user: User): Promise<{ message: string }> {
    await this.authService.logout(user.id);
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
        isEmailVerified: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        lastLoginAt: { type: 'string', format: 'date-time', nullable: true }
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
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
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
} 