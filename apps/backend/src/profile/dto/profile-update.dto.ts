import { ApiProperty } from '@nestjs/swagger';
import { ProfileVisibility } from '../../entities/user.entity';
import { IsOptional, IsString, IsArray, MaxLength, Length, IsBoolean, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ 
    description: '닉네임 (username)', 
    required: false, 
    example: 'john_doe',
    minLength: 2,
    maxLength: 30 
  })
  @IsOptional()
  @IsString()
  @Length(2, 30, { message: 'Username must be between 2 and 30 characters' })
  username?: string;

  @ApiProperty({ 
    description: '한줄소개 (bio)', 
    required: false, 
    example: 'Love to explore new places',
    maxLength: 500 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
  @ApiProperty({ 
    description: '프로필 이미지 URL', 
    required: false,
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ 
    description: 'MBTI 타입', 
    required: false, 
    example: 'INFJ',
    maxLength: 4 
  })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  mbti?: string;

  @ApiProperty({ 
    description: '관심사 배열', 
    required: false, 
    type: [String],
    example: ['여행', '독서', '음악'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ 
    description: '직업', 
    required: false,
    maxLength: 100,
    example: '소프트웨어 개발자'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @ApiProperty({ 
    description: '지역/위치', 
    required: false,
    maxLength: 100,
    example: '서울'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({ 
    description: '기술/능력 배열', 
    required: false, 
    type: [String],
    example: ['JavaScript', 'React', 'Node.js'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ 
    description: '언어 배열', 
    required: false, 
    type: [String],
    example: ['한국어', '영어', '일본어'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ 
    description: '가장 기억에 남는 장소', 
    required: false,
    maxLength: 500 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  memorablePlace?: string;

  @ApiProperty({ 
    description: '어린 시절 추억', 
    required: false,
    maxLength: 500 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  childhoodMemory?: string;

  @ApiProperty({ 
    description: '인생의 터닝포인트', 
    required: false,
    maxLength: 500 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  turningPoint?: string;

  @ApiProperty({ 
    description: '가장 자랑스러웠던 순간', 
    required: false,
    maxLength: 500 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  proudestMoment?: string;

  @ApiProperty({ 
    description: '버킷리스트', 
    required: false,
    maxLength: 500 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bucketList?: string;

  @ApiProperty({ 
    description: '인생에서 배운 교훈', 
    required: false,
    maxLength: 500 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lifeLesson?: string;
}

export class UpdateProfileSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublicProfile?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showProfileViewers?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowMessagesFromStrangers?: boolean;

  @ApiProperty({ required: false, enum: ProfileVisibility })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;
}

export class ProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email address', required: false })
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Profile avatar URL', required: false })
  avatarUrl?: string;

  @ApiProperty({ description: 'Bio/한줄소개', required: false })
  bio?: string;

  @ApiProperty({ description: 'Location information', required: false })
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };

  @ApiProperty({ description: 'Profile completion status' })
  profileCompleted: boolean;

  @ApiProperty({ description: 'Profile completion score', required: false })
  profileCompletionScore?: number;

  @ApiProperty({ description: 'Profile visibility setting' })
  profileVisibility?: string;

  @ApiProperty({ description: 'MBTI 타입', required: false })
  mbti?: string;

  @ApiProperty({ description: '관심사 배열', required: false, type: [String] })
  interests?: string[];

  @ApiProperty({ description: '가장 기억에 남는 장소', required: false })
  memorablePlace?: string;

  @ApiProperty({ description: '어린 시절 추억', required: false })
  childhoodMemory?: string;

  @ApiProperty({ description: '인생의 터닝포인트', required: false })
  turningPoint?: string;

  @ApiProperty({ description: '가장 자랑스러웠던 순간', required: false })
  proudestMoment?: string;

  @ApiProperty({ description: '버킷리스트', required: false })
  bucketList?: string;

  @ApiProperty({ description: '인생에서 배운 교훈', required: false })
  lifeLesson?: string;

  @ApiProperty({ description: 'Signature Connection full data', required: false })
  signatureConnection?: {
    mbti?: string;
    interests?: string[];
    memorablePlace?: string;
    childhoodMemory?: string;
    turningPoint?: string;
    proudestMoment?: string;
    bucketList?: string;
    lifeLesson?: string;
    preferredMbti?: string[];
    preferredInterests?: string[];
    preferredAgeMin?: number;
    preferredAgeMax?: number;
    preferredDistance?: number;
  };

  @ApiProperty({ description: 'Profile view count' })
  profileViews?: number;

  @ApiProperty({ description: 'User verification status' })
  isVerified?: boolean;

  @ApiProperty({ description: 'User settings', required: false })
  settings?: any;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last profile update date', required: false })
  updatedAt?: Date;

  @ApiProperty({ description: 'Last active date', required: false })
  lastActiveAt?: Date;
}