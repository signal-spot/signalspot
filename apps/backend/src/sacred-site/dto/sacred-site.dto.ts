import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, Max, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { SiteTier, SiteStatus } from '../entities/sacred-site.entity';
import { ActivityType } from '../entities/site-activity.entity';

export class CreateSacredSiteDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @Min(50)
  @Max(2000)
  radius: number;

  @IsOptional()
  @IsString()
  discovererUserId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SacredSiteQueryDto {
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
  @Min(0.1)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  radiusKm?: number = 10;

  @IsOptional()
  @IsEnum(SiteTier)
  tier?: SiteTier;

  @IsOptional()
  @IsEnum(SiteStatus)
  status?: SiteStatus = SiteStatus.ACTIVE;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @IsOptional()
  @IsEnum(['score', 'distance', 'recent', 'name'])
  sortBy?: 'score' | 'distance' | 'recent' | 'name' = 'score';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class RecordVisitDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class RecordActivityDto {
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  relatedContentId?: string;

  @IsOptional()
  @IsString()
  relatedContentType?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  metadata?: any;
}

export class LeaderboardQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsEnum(SiteTier)
  tier?: SiteTier;

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
  @Min(0.1)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  radiusKm?: number;
}

export class SiteStatisticsQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  days?: number = 30;
}

export class DiscoveryTriggerDto {
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(20)
  minPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1000)
  maxDistance?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  minWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1)
  timeDecayFactor?: number;
}

export class UpdateRankingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  visitWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  uniqueVisitorsWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  engagementWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  growthWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  recencyWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  diversityWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  consistencyWeight?: number;
}

export interface SacredSiteResponse {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  radius: number;
  tier: SiteTier;
  status: SiteStatus;
  clusterPoints: number;
  metrics: {
    totalScore: number;
    visitCount: number;
    uniqueVisitorCount: number;
    spotCount: number;
    totalEngagement: number;
    averageEngagementRate: number;
    growthRate: number;
    recencyScore: number;
  };
  discovery: {
    discovererUserId?: string;
    discoveredAt: Date;
    firstActivityAt: Date;
    lastActivityAt: Date;
  };
  tags?: string[];
  distance?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteListResponse {
  sites: SacredSiteResponse[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface LeaderboardResponse {
  leaderboard: Array<{
    rank: number;
    site: SacredSiteResponse;
    score: number;
    tier: SiteTier;
  }>;
  generatedAt: Date;
}

export interface SiteStatisticsResponse {
  siteId: string;
  period: {
    startDate: Date;
    endDate: Date;
    days: number;
  };
  activity: {
    totalVisits: number;
    uniqueVisitors: number;
    totalActivities: number;
    activityBreakdown: Record<ActivityType, number>;
    growthRate: number;
  };
  patterns: {
    hourlyPattern: number[];
    dailyPattern: number[];
    peakActivityHour: number;
    peakActivityDay: number;
  };
  ranking: {
    currentScore: number;
    currentTier: SiteTier;
    scoreHistory?: Array<{
      date: Date;
      score: number;
      tier: SiteTier;
    }>;
  };
}

export interface DiscoveryResultResponse {
  discovery: {
    triggeredAt: Date;
    completedAt: Date;
    totalClusters: number;
  };
  results: {
    newSites: SacredSiteResponse[];
    updatedSites: SacredSiteResponse[];
    dormantSites: string[];
  };
  summary: {
    newSitesCount: number;
    updatedSitesCount: number;
    dormantSitesCount: number;
    totalActiveSites: number;
  };
}