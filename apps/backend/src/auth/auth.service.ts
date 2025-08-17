import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/services/logger.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

// Firebase Admin SDK
let admin: any;
try {
  admin = require('firebase-admin');
} catch (error) {
  // Firebase Admin SDK not available
  admin = null;
}


export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}


@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, username } = registerDto;

    // Validate password strength
    this.validatePassword(password);

    // Check if user already exists
    const existingUser = await this.em.findOne(User, {
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already taken');
      }
    }

    // Create new user using domain factory
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
    const user = User.create({
      email,
      username,
      password: hashedPassword,
      loginAttempts: 0,
      accountLocked: false,
    });
    
    // Set status to VERIFIED immediately
    user.status = UserStatus.VERIFIED;

    await this.em.persistAndFlush(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.em.findOne(User, { email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.accountLocked && user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60);
      throw new UnauthorizedException(`Account locked. Try again in ${remainingTime} minutes`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.accountLocked = false;
      user.lockedUntil = null;
      await this.em.flush();
    }

    // Update last login
    user.lastLoginAt = new Date();
    
    // Update device token if provided
    if (loginDto.deviceToken && loginDto.platform) {
      if (loginDto.platform === 'fcm') {
        user.fcmToken = loginDto.deviceToken;
      } else if (loginDto.platform === 'apns') {
        user.apnsToken = loginDto.deviceToken;
      }
    }
    
    await this.em.flush();

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string, platform?: 'fcm' | 'apns'): Promise<void> {
    // In a production app, you might want to blacklist the token
    // For now, we'll just update the user's last logout time
    const user = await this.em.findOne(User, { id: userId });
    if (user) {
      user.lastLogoutAt = new Date();
      
      // Clear device token on logout if platform is specified
      if (platform) {
        if (platform === 'fcm') {
          user.fcmToken = null;
        } else if (platform === 'apns') {
          user.apnsToken = null;
        }
      }
      
      await this.em.flush();
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.em.findOne(User, { id: payload.sub });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Update last login time
      user.lastLoginAt = new Date();
      await this.em.flush();

      // Generate new tokens (both access and refresh)
      const tokens = await this.generateTokens(user);

      this.logger.logWithUser(`Token refreshed`, user.id, 'AuthService');
      return tokens;
    } catch (error) {
      this.logger.error('Refresh token validation failed', error.message, 'AuthService');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { 
      sub: user.id, 
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    user.loginAttempts += 1;

    if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      user.accountLocked = true;
      user.lockedUntil = new Date(Date.now() + this.LOCKOUT_TIME);
    }

    await this.em.flush();
  }

  private validatePassword(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    if (!hasUpperCase) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (!hasLowerCase) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (!hasNumbers) {
      throw new BadRequestException('Password must contain at least one number');
    }

    if (!hasSpecialChar) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  async validateUser(payload: { sub: string }): Promise<User | null> {
    const user = await this.em.findOne(User, { id: payload.sub });
    return user;
  }

  async sendEmailVerification(userId: string): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate verification token (24 hours expiry)
    const verificationToken = this.jwtService.sign(
      { sub: user.id, type: 'email_verification' },
      { expiresIn: '24h' }
    );

    // TODO: Send email with verification link
    // For now, just log the token (in production, use proper email service)
    this.logger.logSecure('Email verification token generated', { email: user.email, token: verificationToken }, 'AuthService');
    
    // In production, you would send an email like:
    // await this.emailService.sendVerificationEmail(user.email, verificationToken);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid verification token');
      }

      const user = await this.em.findOne(User, { id: payload.sub });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.emailVerifiedAt) {
        return { message: 'Email is already verified' };
      }

      user.emailVerifiedAt = new Date();
      await this.em.flush();

      return { message: 'Email successfully verified' };
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendEmailVerification(email: string): Promise<{ message: string }> {
    const user = await this.em.findOne(User, { email });
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If the email exists, a verification link has been sent' };
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendEmailVerification(user.id);
    return { message: 'Verification email sent successfully' };
  }

  // Phone Authentication Methods
  async findOrCreateUserByPhone(phoneNumber: string, userData?: {
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ user: User; profileCompleted: boolean }> {
    // 1. 기존 사용자 확인
    let user = await this.em.findOne(User, { phoneNumber });

    if (user) {
      // 기존 사용자
      user.lastLoginAt = new Date();
      
      // Update username if provided and different
      if (userData?.username && user.username !== userData.username) {
        // Check if new username is available
        const existingWithUsername = await this.em.findOne(User, { 
          username: userData.username,
          id: { $ne: user.id }
        });
        
        if (!existingWithUsername) {
          user.username = userData.username;
        }
      }
      
      // Update first/last name if provided
      if (userData?.firstName) {
        user.firstName = userData.firstName;
      }
      if (userData?.lastName) {
        user.lastName = userData.lastName;
      }
      
      await this.em.flush();
      return { user, profileCompleted: user.profileCompleted };
    }

    // 2. 신규 사용자 - 최소 정보만으로 생성
    const timestamp = Date.now();
    
    // Create new user using domain factory with temporary values
    user = User.create({
      phoneNumber,
      // 임시 값들 - 프로필 설정에서 업데이트 예정
      email: `temp_${timestamp}@signalspot.phone`,
      username: `temp_${timestamp}`,
      password: await bcrypt.hash(phoneNumber + timestamp, this.SALT_ROUNDS),
      isPhoneVerified: true,
      status: UserStatus.PENDING_PROFILE, // 새로운 상태 - 프로필 설정 대기
      profileCompleted: false, // 프로필 완성 여부 플래그
      firstName: userData?.firstName,
      lastName: userData?.lastName,
    });

    user.lastLoginAt = new Date();
    await this.em.persistAndFlush(user);

    return { user, profileCompleted: false }; // 새 사용자는 항상 프로필 미완성
  }

  async authenticateWithPhone(phoneNumber: string, userData?: {
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    const { user } = await this.findOrCreateUserByPhone(phoneNumber, userData);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
      refreshToken,
    };
  }

  async checkPhoneExists(phoneNumber: string): Promise<boolean> {
    const user = await this.em.findOne(User, { phoneNumber });
    return !!user;
  }

  async verifyFirebaseToken(firebaseToken: string): Promise<{ phoneNumber: string; uid: string }> {
    // Development/test mode check for test tokens
    const isDevelopment = this.configService.get('NODE_ENV') !== 'production';
    
    // Handle test tokens in development mode only
    if (isDevelopment && firebaseToken && firebaseToken.startsWith('test-token-')) {
      this.logger.warn('[DEV] Development test token detected, skipping Firebase verification', 'AuthService');
      return {
        phoneNumber: '+8201012345678', // Test phone number for dev
        uid: `dev-test-uid-${Date.now()}`,
      };
    }
    
    if (!admin) {
      this.logger.warn('Firebase Admin SDK not available, skipping token verification', 'AuthService');
      throw new UnauthorizedException('Firebase authentication not available');
    }

    try {
      // Check if Firebase is initialized
      if (!admin.apps.length) {
        // Initialize Firebase if not already initialized
        const serviceAccount = this.configService.get('firebase.serviceAccount');
        if (!serviceAccount) {
          this.logger.error('Firebase service account not found in config', null, 'AuthService');
          throw new UnauthorizedException('Firebase not configured');
        }
        
        this.logger.log('Initializing Firebase Admin SDK in AuthService', 'AuthService');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || this.configService.get('firebase.projectId'),
        });
        this.logger.log(`Firebase Admin SDK initialized successfully with project ID: ${serviceAccount.project_id}`, 'AuthService');
      }

      // Log token info for debugging (remove in production)
      this.logger.debug(`Attempting to verify Firebase token: ${firebaseToken?.substring(0, 20)}...`, 'AuthService');

      // Verify the Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      
      // Extract phone number from token
      const phoneNumber = decodedToken.phone_number;
      if (!phoneNumber) {
        this.logger.warn('Phone number not found in decoded Firebase token', 'AuthService');
        throw new UnauthorizedException('Phone number not found in Firebase token');
      }

      this.logger.debug(`Firebase token verified successfully for phone: ${phoneNumber}`, 'AuthService');
      
      return {
        phoneNumber,
        uid: decodedToken.uid,
      };
    } catch (error) {
      // Log more detailed error information
      if (error.code === 'auth/argument-error') {
        this.logger.error('Invalid Firebase token format', error.message, 'AuthService');
      } else if (error.code === 'auth/id-token-expired') {
        this.logger.error('Firebase token has expired', error.message, 'AuthService');
      } else if (error.code === 'auth/id-token-revoked') {
        this.logger.error('Firebase token has been revoked', error.message, 'AuthService');
      } else if (error.code === 'auth/invalid-id-token') {
        this.logger.error('Invalid Firebase ID token', error.message, 'AuthService');
      } else {
        this.logger.error(`Firebase token verification failed: ${error.message}`, error.stack, 'AuthService');
      }
      
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  
  async authenticateWithPhoneAndFirebase(
    phoneNumber: string, 
    firebaseToken: string,
    userData?: {
      username?: string;
      firstName?: string;
      lastName?: string;
    }
  ): Promise<AuthResponse & { profileCompleted: boolean }> {
    // Special handling for test phone number - bypass Firebase verification entirely
    const TEST_PHONE_NUMBER = '+821011111111';
    
    let verifiedData: { phoneNumber: string; uid: string };
    
    if (phoneNumber === TEST_PHONE_NUMBER) {
      // Skip Firebase verification for test phone number
      this.logger.log(`[TEST] Bypassing Firebase verification for test phone number: ${TEST_PHONE_NUMBER}`, 'AuthService');
      verifiedData = {
        phoneNumber: TEST_PHONE_NUMBER,
        uid: `test-uid-${Date.now()}`,
      };
    } else {
      // Normal Firebase verification for other phone numbers
      verifiedData = await this.verifyFirebaseToken(firebaseToken);
      
      // Ensure the phone number matches the one in the token
      if (verifiedData.phoneNumber !== phoneNumber) {
        this.logger.error(`Phone number mismatch: token=${verifiedData.phoneNumber}, provided=${phoneNumber}`, null, 'AuthService');
        throw new UnauthorizedException('Phone number mismatch with Firebase token');
      }
    }

    // 전화번호로 사용자 찾기 또는 생성
    const { user, profileCompleted } = await this.findOrCreateUserByPhone(phoneNumber, userData);
    
    // Store Firebase UID for future reference
    if (!user.firebaseUid) {
      user.firebaseUid = verifiedData.uid;
    }
    
    // JWT 토큰 생성
    const tokens = await this.generateTokens(user);
    
    // 로그인 시간 업데이트
    user.recordLogin();
    await this.em.flush();

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      profileCompleted,
    };
  }

  // Account deletion methods
  async deleteAccount(userId: string, password?: string): Promise<{ 
    message: string; 
    recoveryToken: string;
    recoveryExpiresAt: Date;
  }> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if account is already deleted
    if (user.isDeleted()) {
      throw new BadRequestException('Account is already deleted');
    }

    // If password is provided, verify it (for extra security)
    if (password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    // Perform soft delete
    user.deactivate('User requested account deletion', userId);
    
    // Clear all user sessions (in production, you might want to blacklist tokens)
    // For now, just log the deletion
    this.logger.logWithUser(`Account deletion initiated`, userId, 'AuthService');
    
    await this.em.flush();

    return {
      message: 'Your account has been successfully deleted. You have 30 days to recover your account using the recovery token.',
      recoveryToken: user.recoveryToken!,
      recoveryExpiresAt: user.recoveryTokenExpires!,
    };
  }

  async recoverAccount(recoveryToken: string, email: string): Promise<{
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
    };
  }> {
    // Find user by recovery token
    const user = await this.em.findOne(User, { 
      recoveryToken,
      email: { $like: `deleted_%@signalspot.deleted` } // Pattern for deleted accounts
    });

    if (!user) {
      throw new BadRequestException('Invalid recovery token');
    }

    // Check if account can be recovered
    if (!user.canRecover()) {
      throw new BadRequestException('Recovery period has expired or recovery is not available');
    }

    // Recover the account
    user.recover();
    
    // Set new email (since the original was anonymized)
    user.email = email;
    
    // Generate a temporary username if needed
    const timestamp = Date.now();
    user.username = `recovered_${timestamp}`;
    
    await this.em.flush();

    this.logger.logWithUser(`Account recovered successfully`, user.id, 'AuthService');

    return {
      message: 'Your account has been recovered. Please update your profile information.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async checkRecoveryStatus(recoveryToken: string): Promise<{
    canRecover: boolean;
    expiresAt?: Date;
    message: string;
  }> {
    const user = await this.em.findOne(User, { recoveryToken });

    if (!user) {
      return {
        canRecover: false,
        message: 'Invalid recovery token',
      };
    }

    if (!user.canRecover()) {
      return {
        canRecover: false,
        message: 'Recovery period has expired',
      };
    }

    return {
      canRecover: true,
      expiresAt: user.recoveryTokenExpires!,
      message: 'Account can be recovered',
    };
  }
} 