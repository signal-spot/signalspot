import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ApiResponse } from './api.service';

// User type definition
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  bio?: string;
  interests?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  isVerified: boolean;
  isPrivate: boolean;
  createdAt: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      showLocation: boolean;
      showActivity: boolean;
      allowMessages: boolean;
      allowFriendRequests: boolean;
    };
    appearance: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      timezone: string;
    };
  };
}

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://api.signalspot.com/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    isEmailVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = '@signalspot:access_token';
  private readonly REFRESH_TOKEN_KEY = '@signalspot:refresh_token';
  private readonly USER_KEY = '@signalspot:user';

  // API Request helper with automatic token attachment
  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const accessToken = await this.getAccessToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle token expiration
    if (response.status === 401 && accessToken) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${refreshed.accessToken}`,
        };
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!retryResponse.ok) {
          throw await this.handleApiError(retryResponse);
        }
        return retryResponse.json();
      } else {
        // Refresh failed, logout user
        await this.logout();
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      throw await this.handleApiError(response);
    }

    return response.json();
  }

  private async handleApiError(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || 'An error occurred',
        statusCode: response.status,
        error: errorData.error,
      };
    } catch {
      return {
        message: 'Network error occurred',
        statusCode: response.status,
      };
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials, 'login');
    await this.storeAuthData(response);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData, 'register');
    await this.storeAuthData(response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate server-side session
      await apiService.post('/auth/logout', {}, 'logout');
    } catch (error) {
      // Continue with local logout even if server call fails
      console.warn('Server logout failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  async refreshToken(): Promise<{ accessToken: string } | null> {
    return apiService.refreshToken();
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/profile', {}, 'profile');
    return response.data;
  }

  // Email verification
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/auth/resend-verification',
      {},
      'resendVerification'
    );
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/auth/verify-email',
      { token },
      'verifyEmail'
    );
    return response.data;
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      { email },
      'forgotPassword'
    );
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      { token, newPassword },
      'resetPassword'
    );
    return response.data;
  }

  // Two-factor authentication
  async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    const response = await apiService.post<ApiResponse<{ qrCode: string; secret: string }>>(
      '/auth/2fa/enable',
      {},
      'enable2FA'
    );
    return response.data;
  }

  async verifyTwoFactor(token: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/auth/2fa/verify',
      { token },
      'verify2FA'
    );
    return response.data;
  }

  async disableTwoFactor(token: string): Promise<{ message: string }> {
    const response = await apiService.post<ApiResponse<{ message: string }>>(
      '/auth/2fa/disable',
      { token },
      'disable2FA'
    );
    return response.data;
  }

  // Token Management
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to set access token:', error);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to set refresh token:', error);
    }
  }

  // User Data Management
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to set current user:', error);
    }
  }

  // Authentication State
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return !!(accessToken || refreshToken);
  }

  // Helper Methods
  private async storeAuthData(authResponse: AuthResponse): Promise<void> {
    await Promise.all([
      this.setAccessToken(authResponse.accessToken),
      this.setRefreshToken(authResponse.refreshToken),
      this.setCurrentUser(authResponse.user as User),
    ]);
  }

  private async clearAuthData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(this.USER_KEY),
    ]);
  }

  // Validation Helpers
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 30) {
      errors.push('Username must be less than 30 characters');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const authService = new AuthService(); 