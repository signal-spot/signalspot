import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { profileService, UserProfile, UpdateProfileRequest, ProfileAnalytics } from '../services/profile.service';
import { useAuth } from './AuthProvider';

interface ProfileContextType {
  profile: UserProfile | null;
  analytics: ProfileAnalytics | null;
  isLoading: boolean;
  isUpdating: boolean;
  profileCompletionPercentage: number;
  
  // Actions
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateProfileSettings: (settings: any) => Promise<void>;
  updateProfileVisibility: (visibility: 'public' | 'friends' | 'private') => Promise<void>;
  uploadAvatar: (imageData: { uri: string; type: string; name: string }) => Promise<void>;
  removeAvatar: () => Promise<void>;
  getProfileAnalytics: () => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate profile completion percentage
  const profileCompletionPercentage = profile 
    ? profileService.getProfileCompletionPercentage(profile)
    : 0;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await profileService.getCurrentProfile();
      
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Validate data before sending
      const validationErrors = profileService.validateProfileData(data);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Sanitize data
      const sanitizedData = profileService.sanitizeProfileData(data);
      
      const response = await profileService.updateProfile(sanitizedData);
      
      if (response.success && response.data) {
        setProfile(response.data);
        Alert.alert('성공', '프로필이 업데이트되었습니다.');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateProfileSettings = useCallback(async (settings: any) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await profileService.updateProfileSettings(settings);
      
      if (response.success) {
        // Refresh profile to get updated settings
        await refreshProfile();
        Alert.alert('성공', '설정이 업데이트되었습니다.');
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [refreshProfile]);

  const updateProfileVisibility = useCallback(async (visibility: 'public' | 'friends' | 'private') => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await profileService.updateProfileVisibility(visibility);
      
      if (response.success) {
        // Refresh profile to get updated visibility
        await refreshProfile();
        Alert.alert('성공', '프로필 공개 설정이 업데이트되었습니다.');
      } else {
        throw new Error(response.message || 'Failed to update visibility');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update visibility';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [refreshProfile]);

  const uploadAvatar = useCallback(async (imageData: { uri: string; type: string; name: string }) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await profileService.uploadAvatar(imageData);
      
      if (response.success && response.data) {
        setProfile(response.data);
        Alert.alert('성공', '프로필 사진이 업로드되었습니다.');
      } else {
        throw new Error(response.message || 'Failed to upload avatar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const removeAvatar = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await profileService.removeAvatar();
      
      if (response.success && response.data) {
        setProfile(response.data);
        Alert.alert('성공', '프로필 사진이 삭제되었습니다.');
      } else {
        throw new Error(response.message || 'Failed to remove avatar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove avatar';
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const getProfileAnalytics = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      
      const response = await profileService.getProfileAnalytics();
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
    }
  }, [isAuthenticated]);

  // Initialize profile when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshProfile();
    } else {
      setProfile(null);
      setAnalytics(null);
    }
  }, [isAuthenticated, user, refreshProfile]);

  const value: ProfileContextType = {
    profile,
    analytics,
    isLoading,
    isUpdating,
    profileCompletionPercentage,
    refreshProfile,
    updateProfile,
    updateProfileSettings,
    updateProfileVisibility,
    uploadAvatar,
    removeAvatar,
    getProfileAnalytics,
    error,
    clearError,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};