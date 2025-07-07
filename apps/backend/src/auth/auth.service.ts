import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';

import { JwtPayload } from './strategies/jwt.strategy';

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
    isEmailVerified: boolean;
  };
}

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  password: string;
  username: string;
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
      isEmailVerified: false,
      loginAttempts: 0,
      accountLocked: false,
    });

    await this.em.persistAndFlush(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
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
    await this.em.flush();

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    // In a production app, you might want to blacklist the token
    // For now, we'll just update the user's last logout time
    const user = await this.em.findOne(User, { id: userId });
    if (user) {
      user.lastLogoutAt = new Date();
      await this.em.flush();
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.em.findOne(User, { id: payload.sub });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        { 
          sub: user.id, 
          email: user.email,
          username: user.username,
        },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        }
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
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

  async validateUser(payload: any): Promise<User | null> {
    const user = await this.em.findOne(User, { id: payload.sub });
    return user;
  }
} 