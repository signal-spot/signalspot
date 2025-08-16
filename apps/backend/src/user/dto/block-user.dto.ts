import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({ 
    description: 'User ID to block',
    example: 'c22cdac9-14f9-45bd-b296-881d06f810df'
  })
  @IsUUID()
  userId: string;
  
  @ApiProperty({ 
    description: 'Optional reason for blocking', 
    required: false,
    example: 'Inappropriate behavior'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}