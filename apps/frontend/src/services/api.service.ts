import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' 
  : 'https://api.signalspot.com/api';

// Common interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoff: number;
  retryCondition?: (error: ApiError) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  delay: 1000,
  backoff: 2,
  retryCondition: (error) => error.statusCode >= 500 || error.statusCode === 429,
};

// Loading state manager
class LoadingManager {
  private loadingStates = new Map<string, boolean>();
  private listeners = new Map<string, Set<(loading: boolean) => void>>();

  setLoading(key: string, loading: boolean) {
    this.loadingStates.set(key, loading);
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener(loading));
    }
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  subscribe(key: string, listener: (loading: boolean) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
    
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener);
      }
    };
  }
}

export const loadingManager = new LoadingManager();

// Base API service class
export class ApiService {
  private readonly ACCESS_TOKEN_KEY = '@signalspot:access_token';
  private readonly REFRESH_TOKEN_KEY = '@signalspot:refresh_token';

  // Utility function to wait
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get stored tokens
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
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

  async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to set access token:', error);
    }
  }

  // Handle API errors
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

  // Refresh access token
  async refreshToken(): Promise<{ accessToken: string } | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      await this.setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // Main API request method with retry logic
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryConfig: Partial<RetryConfig> = {},
    loadingKey?: string
  ): Promise<T> {
    const config = { ...defaultRetryConfig, ...retryConfig };
    let lastError: ApiError | null = null;

    if (loadingKey) {
      loadingManager.setLoading(loadingKey, true);
    }

    try {
      for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
          const accessToken = await this.getAccessToken();
          
          const requestConfig: RequestInit = {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
              ...options.headers,
            },
          };

          const response = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig);
          
          // Handle token expiration
          if (response.status === 401 && accessToken) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              // Retry the request with new token
              requestConfig.headers = {
                ...requestConfig.headers,
                Authorization: `Bearer ${refreshed.accessToken}`,
              };
              const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig);
              if (!retryResponse.ok) {
                throw await this.handleApiError(retryResponse);
              }
              return retryResponse.json();
            } else {
              // Refresh failed, clear tokens and throw error
              await AsyncStorage.multiRemove([this.ACCESS_TOKEN_KEY, this.REFRESH_TOKEN_KEY]);
              throw new Error('Session expired. Please login again.');
            }
          }

          if (!response.ok) {
            const error = await this.handleApiError(response);
            lastError = error;
            
            // Check if we should retry
            if (attempt < config.maxRetries && config.retryCondition && config.retryCondition(error)) {
              const delay = config.delay * Math.pow(config.backoff, attempt);
              await this.wait(delay);
              continue;
            }
            
            throw error;
          }

          return response.json();
        } catch (error) {
          if (error instanceof Error) {
            lastError = {
              message: error.message,
              statusCode: 0,
            };
          } else {
            lastError = error as ApiError;
          }
          
          // Check if we should retry
          if (attempt < config.maxRetries && config.retryCondition && config.retryCondition(lastError)) {
            const delay = config.delay * Math.pow(config.backoff, attempt);
            await this.wait(delay);
            continue;
          }
          
          throw lastError;
        }
      }

      throw lastError || new Error('Request failed after all retries');
    } finally {
      if (loadingKey) {
        loadingManager.setLoading(loadingKey, false);
      }
    }
  }

  // Convenience methods for different HTTP methods
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    loadingKey?: string
  ): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: 'GET' }, {}, loadingKey);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    loadingKey?: string
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      {},
      loadingKey
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    loadingKey?: string
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      {},
      loadingKey
    );
  }

  async delete<T>(
    endpoint: string,
    loadingKey?: string
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, {}, loadingKey);
  }

  // File upload method
  async uploadFile<T>(
    endpoint: string,
    file: {
      uri: string;
      name: string;
      type: string;
    },
    additionalData?: Record<string, string>,
    loadingKey?: string
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file as any);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const accessToken = await this.getAccessToken();
    
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: formData,
      },
      {},
      loadingKey
    );
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export hook for loading states
export const useLoadingState = (key: string) => {
  const [loading, setLoading] = React.useState(loadingManager.isLoading(key));

  React.useEffect(() => {
    const unsubscribe = loadingManager.subscribe(key, setLoading);
    return unsubscribe;
  }, [key]);

  return loading;
};