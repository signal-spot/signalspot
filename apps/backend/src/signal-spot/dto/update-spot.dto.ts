import { 
  IsString, 
  IsOptional, 
  IsArray, 
  ArrayMaxSize,
  Length
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpotDto {
  @ApiPropertyOptional({
    description: 'Updated message content of the signal spot',
    example: 'Updated: Great coffee shop with free WiFi and pastries!',
    minLength: 1,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(1, 500, { message: 'Message must be between 1 and 500 characters' })
  message?: string;

  @ApiPropertyOptional({
    description: 'Updated title for the signal spot',
    example: 'Updated Coffee Shop Recommendation',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated array of tags to categorize the signal spot',
    example: ['coffee', 'wifi', 'study', 'pastries'],
    maxItems: 10,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  @IsString({ each: true })
  @Length(1, 30, { each: true, message: 'Each tag must be between 1 and 30 characters' })
  tags?: string[];
}