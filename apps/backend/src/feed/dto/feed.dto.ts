import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ContentType {
  SPOT = 'spot',
  SPARK = 'spark',
  MIXED = 'mixed',
}

export enum SortOrder {
  RECENT = 'recent',
  POPULAR = 'popular', 
  RELEVANT = 'relevant',
  NEARBY = 'nearby',
}

export class FeedQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType = ContentType.MIXED;

  @IsOptional()
  @IsEnum(SortOrder)
  sortBy?: SortOrder = SortOrder.RELEVANT;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(50000)
  @Transform(({ value }) => parseFloat(value))
  radiusMeters?: number = 5000;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168) // 1 week
  @Transform(({ value }) => parseInt(value))
  hoursAgo?: number = 24;
}

export class TodaysConnectionQueryDto {
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD format, defaults to today

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(50000)
  @Transform(({ value }) => parseFloat(value))
  radiusMeters?: number = 10000;
}

export interface FeedItem {
  id: string;
  type: 'spot' | 'spark';
  title: string;
  content?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: Date;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  tags?: string[];
  distance?: number;
  relevanceScore: number;
  interactionData?: {
    hasLiked: boolean;
    hasCommented: boolean;
    hasShared: boolean;
  };
}

export interface FeedResponse {
  items: FeedItem[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  metadata: {
    algorithm: string;
    generatedAt: Date;
    userLocation?: {
      latitude: number;
      longitude: number;
    };
    filters: {
      contentType: ContentType;
      sortBy: SortOrder;
      radiusMeters: number;
      hoursAgo: number;
    };
  };
}

export interface PersonalizationData {
  userId: string;
  interests: string[];
  recentInteractions: Array<{
    contentId: string;
    contentType: 'spot' | 'spark';
    action: 'view' | 'like' | 'comment' | 'share';
    timestamp: Date;
  }>;
  locationHistory: Array<{
    latitude: number;
    longitude: number;
    timestamp: Date;
  }>;
  preferredTags: string[];
  engagementMetrics: {
    avgSessionDuration: number;
    contentTypePref: { spots: number; sparks: number };
    timeOfDayActivity: { [hour: string]: number };
  };
}

export interface TodaysConnectionResponse {
  date: string;
  summary: {
    totalConnections: number;
    newSparks: number;
    revisitedSpots: number;
    meaningfulInteractions: number;
  };
  highlights: Array<{
    type: 'spark' | 'spot' | 'interaction';
    title: string;
    description: string;
    timestamp: Date;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    participants?: Array<{
      id: string;
      username: string;
      avatar?: string;
    }>;
    score: number;
  }>;
  insights: {
    connectionPattern: string;
    locationInsight: string;
    timePattern: string;
    socialInsight: string;
  };
  recommendations: Array<{
    type: 'location' | 'user' | 'content';
    title: string;
    description: string;
    score: number;
    data?: any;
  }>;
}