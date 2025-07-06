import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        // Try to get user from storage first
        const storedUser = await authService.getCurrentUser();
        
        if (storedUser) {
          setUser(storedUser);
          
          // Optionally refresh profile from server
          try {
            const freshProfile = await authService.getProfile();
            setUser(freshProfile);
            await authService.setCurrentUser(freshProfile);
          } catch (error) {
            console.warn('Failed to refresh profile:', error);
            // Keep stored user if refresh fails
          }
        } else {
          // No stored user but has tokens, try to get profile
          try {
            const profile = await authService.getProfile();
            setUser(profile);
            await authService.setCurrentUser(profile);
          } catch (error) {
            console.error('Failed to get profile:', error);
            // Clear invalid tokens
            await authService.logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear any corrupted auth data
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if server call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      if (!user) return;
      
      const freshProfile = await authService.getProfile();
      setUser(freshProfile);
      await authService.setCurrentUser(freshProfile);
    } catch (error) {
      console.error('Profile refresh failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 