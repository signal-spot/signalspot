import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsUUID, MaxLength, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType, ReportReason, ReportStatus, ReportAction } from '../../entities/report.entity';

export class CreateReportDto {
  @ApiProperty({ 
    description: 'Type of report',
    enum: ReportType,
    example: ReportType.SIGNAL_SPOT
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ 
    description: 'ID of the target being reported',
    example: 'uuid-here'
  })
  @IsUUID()
  targetId: string;

  @ApiProperty({ 
    description: 'Reason for the report',
    enum: ReportReason,
    example: ReportReason.SPAM
  })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional({ 
    description: 'Additional description or details about the report',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class UpdateReportDto {
  @ApiProperty({ 
    description: 'New status for the report',
    enum: ReportStatus
  })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiPropertyOptional({ 
    description: 'Action taken on the report',
    enum: ReportAction
  })
  @IsOptional()
  @IsEnum(ReportAction)
  actionTaken?: ReportAction;

  @ApiPropertyOptional({ 
    description: 'Review notes from the admin',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ReportQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by report type',
    enum: ReportType
  })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ 
    description: 'Filter by report status',
    enum: ReportStatus
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by report reason',
    enum: ReportReason
  })
  @IsOptional()
  @IsEnum(ReportReason)
  reason?: ReportReason;

  @ApiPropertyOptional({ 
    description: 'Filter by reporter ID'
  })
  @IsOptional()
  @IsUUID()
  reporterId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter reports from this date'
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ 
    description: 'Filter reports to this date'
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ 
    description: 'Number of results to return',
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ 
    description: 'Number of results to skip',
    default: 0,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class ReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: ReportType;

  @ApiProperty()
  reason: ReportReason;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  status: ReportStatus;

  @ApiProperty()
  actionTaken: ReportAction;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  reporter: any;

  @ApiProperty()
  reportedUser?: any;

  @ApiProperty()
  reportedSpot?: any;

  @ApiProperty()
  reportedComment?: any;

  @ApiProperty()
  reviewedBy?: any;

  @ApiProperty()
  reviewedAt?: Date;

  @ApiProperty()
  resolvedAt?: Date;
}