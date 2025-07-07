export interface SignatureConnectionPreferencesDto {
  interests: string[];
  personalityTraits: string[];
  lifestyle: string[];
  bio: string;
  lookingFor: string;
  dealBreakers: string;
  ageRange: {
    min: number;
    max: number;
  };
  maxDistance: number;
  isActive: boolean;
}

export interface ConnectionMatchDto {
  userId: string;
  username: string;
  avatarUrl?: string;
  age: number;
  distance: number;
  matchScore: number;
  commonInterests: string[];
  commonTraits: string[];
  bio: string;
  lastActive: Date;
}

export interface SignatureConnectionStatsDto {
  totalMatches: number;
  activeMatches: number;
  averageMatchScore: number;
  topInterests: string[];
  connectionSuccessRate: number;
  lastMatchDate?: Date;
}

export interface ProfileResponseDto {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  skills: string[];
  interests: string[];
  birthDate?: Date;
  visibility: ProfileVisibility;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  signatureConnectionPreferences?: SignatureConnectionPreferencesDto;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  skills?: string[];
  interests?: string[];
  birthDate?: Date;
  avatarUrl?: string;
}

export interface UpdateProfileSettingsDto {
  visibility?: ProfileVisibility;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  locationSharing?: boolean;
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  FRIENDS_ONLY = 'friends_only',
  PRIVATE = 'private'
}

export interface ProfileSearchParams {
  search?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  occupation?: string;
  limit?: number;
  offset?: number;
}

export interface ProfileSearchResult {
  profiles: ProfileResponseDto[];
  total: number;
  hasMore: boolean;
}