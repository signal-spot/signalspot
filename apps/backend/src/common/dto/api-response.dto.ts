import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseMetadata {
  @ApiPropertyOptional({
    description: 'Total count of items',
    example: 100,
  })
  count?: number;

  @ApiPropertyOptional({
    description: 'Current page number',
    example: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages?: number;

  @ApiPropertyOptional({
    description: 'Request ID for tracking',
    example: 'req_123456',
  })
  requestId?: string;

  @ApiPropertyOptional({
    description: 'Response time in milliseconds',
    example: '150ms',
  })
  responseTime?: string;
}

export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Success status of the request',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: ApiResponseMetadata,
  })
  metadata?: ApiResponseMetadata;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
  }

  static success<T>(data: T, message?: string, metadata?: ApiResponseMetadata): ApiResponseDto<T> {
    return new ApiResponseDto({
      success: true,
      data,
      message: message || 'Success',
      metadata,
    });
  }

  static error(message: string, data?: any): ApiResponseDto {
    return new ApiResponseDto({
      success: false,
      data: data || null,
      message,
    });
  }
}

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiPropertyOptional({
    description: 'Whether there are more items',
    example: true,
  })
  hasMore?: boolean;

  @ApiPropertyOptional({
    description: 'Current page number',
    example: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
  })
  limit?: number;

  constructor(partial: Partial<PaginatedResponseDto<T>>) {
    super(partial);
    Object.assign(this, partial);
  }

  static create<T>(
    data: T[],
    total: number,
    page?: number,
    limit?: number,
    message?: string,
  ): PaginatedResponseDto<T> {
    const hasMore = page && limit ? (page * limit) < total : false;
    
    return new PaginatedResponseDto({
      success: true,
      data,
      total,
      hasMore,
      page,
      limit,
      message: message || 'Success',
      metadata: {
        count: data.length,
        page,
        totalPages: limit ? Math.ceil(total / limit) : undefined,
      },
    });
  }
}