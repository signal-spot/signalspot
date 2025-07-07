import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum ConnectionType {
  COLLABORATION = 'collaboration',
  NETWORKING = 'networking',
  FRIENDSHIP = 'friendship',
  MENTORSHIP = 'mentorship',
  ROMANTIC = 'romantic',
}

export enum AvailabilityLevel {
  VERY_ACTIVE = 'very_active',
  ACTIVE = 'active',
  MODERATE = 'moderate',
  OCCASIONAL = 'occasional',
  RARE = 'rare',
}

export enum MeetingPreference {
  IN_PERSON = 'in_person',
  VIRTUAL = 'virtual',
  BOTH = 'both',
}

export class SignatureConnectionPreferencesDto {
  @ApiProperty({ description: 'Types of connections user is interested in', enum: ConnectionType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ConnectionType, { each: true })
  connectionTypes?: ConnectionType[];

  @ApiProperty({ description: 'Creative interests and hobbies', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  creativeInterests?: string[];

  @ApiProperty({ description: 'Professional skills and expertise', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  professionalSkills?: string[];

  @ApiProperty({ description: 'Music genres user enjoys', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  musicGenres?: string[];

  @ApiProperty({ description: 'Favorite artists or creators', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteArtists?: string[];

  @ApiProperty({ description: 'Movie/TV genres user enjoys', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entertainmentGenres?: string[];

  @ApiProperty({ description: 'Book genres and reading preferences', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readingPreferences?: string[];

  @ApiProperty({ description: 'Sports and physical activities', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportsActivities?: string[];

  @ApiProperty({ description: 'Food preferences and cuisines', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodPreferences?: string[];

  @ApiProperty({ description: 'Travel destinations and styles', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  travelPreferences?: string[];

  @ApiProperty({ description: 'Technology interests', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techInterests?: string[];

  @ApiProperty({ description: 'Learning goals and subjects', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningGoals?: string[];

  @ApiProperty({ description: 'How available user is for connections', enum: AvailabilityLevel })
  @IsOptional()
  @IsEnum(AvailabilityLevel)
  availabilityLevel?: AvailabilityLevel;

  @ApiProperty({ description: 'Preferred meeting style', enum: MeetingPreference })
  @IsOptional()
  @IsEnum(MeetingPreference)
  meetingPreference?: MeetingPreference;

  @ApiProperty({ description: 'Preferred age range minimum', minimum: 18, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  ageRangeMin?: number;

  @ApiProperty({ description: 'Preferred age range maximum', minimum: 18, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  ageRangeMax?: number;

  @ApiProperty({ description: 'Maximum distance for connections (in km)', minimum: 1, maximum: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxDistance?: number;

  @ApiProperty({ description: 'User bio or description for connections' })
  @IsOptional()
  @IsString()
  connectionBio?: string;
}

export class ConnectionMatchDto {
  @ApiProperty({ description: 'User ID of the potential match' })
  userId: string;

  @ApiProperty({ description: 'Username of the potential match' })
  username: string;

  @ApiProperty({ description: 'Full name of the potential match' })
  fullName?: string;

  @ApiProperty({ description: 'Avatar URL of the potential match' })
  avatarUrl?: string;

  @ApiProperty({ description: 'Bio or description' })
  bio?: string;

  @ApiProperty({ description: 'Location of the potential match' })
  location?: string;

  @ApiProperty({ description: 'Distance from current user (in km)' })
  distance?: number;

  @ApiProperty({ description: 'Overall compatibility score (0-100)' })
  compatibilityScore: number;

  @ApiProperty({ description: 'Matching connection types', enum: ConnectionType, isArray: true })
  matchingConnectionTypes: ConnectionType[];

  @ApiProperty({ description: 'Common interests', type: [String] })
  commonInterests: string[];

  @ApiProperty({ description: 'Common skills', type: [String] })
  commonSkills: string[];

  @ApiProperty({ description: 'Common music genres', type: [String] })
  commonMusicGenres: string[];

  @ApiProperty({ description: 'Common entertainment preferences', type: [String] })
  commonEntertainment: string[];

  @ApiProperty({ description: 'Last active timestamp' })
  lastActiveAt?: Date;

  @ApiProperty({ description: 'Whether this user has been contacted before' })
  hasBeenContacted: boolean;

  @ApiProperty({ description: 'Mutual connections count' })
  mutualConnections: number;
}

export class SignatureConnectionStatsDto {
  @ApiProperty({ description: 'Total number of potential matches' })
  totalMatches: number;

  @ApiProperty({ description: 'Number of high compatibility matches (80%+)' })
  highCompatibilityMatches: number;

  @ApiProperty({ description: 'Number of medium compatibility matches (60-79%)' })
  mediumCompatibilityMatches: number;

  @ApiProperty({ description: 'Number of low compatibility matches (40-59%)' })
  lowCompatibilityMatches: number;

  @ApiProperty({ description: 'Average compatibility score' })
  averageCompatibilityScore: number;

  @ApiProperty({ description: 'Most common shared interest' })
  topSharedInterest?: string;

  @ApiProperty({ description: 'Most common connection type' })
  topConnectionType?: ConnectionType;

  @ApiProperty({ description: 'Profile completion impact on matches' })
  profileCompletionImpact: {
    currentCompletion: number;
    potentialIncrease: number;
    missingFields: string[];
  };
}