import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsUUID, 
  IsNotEmpty,
  IsNumber,
  Min,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType, MessageStatus, ChatRoomType, ChatRoomStatus } from '../entities';

export class LocationMetadataDto {
  @ApiProperty({ description: '위도' })
  @IsNumber()
  latitude!: number;

  @ApiProperty({ description: '경도' })
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({ description: '주소' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class MessageMetadataDto {
  @ApiPropertyOptional({ description: '이미지 URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '위치 정보' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationMetadataDto)
  location?: LocationMetadataDto;

  @ApiPropertyOptional({ description: '시스템 메시지 타입' })
  @IsOptional()
  @IsString()
  systemMessageType?: string;
}

export class SendMessageDto {
  @ApiProperty({ description: '채팅방 ID' })
  @IsUUID()
  @IsNotEmpty()
  chatRoomId!: string;

  @ApiProperty({ description: '메시지 내용' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ 
    description: '메시지 타입',
    enum: MessageType,
    default: MessageType.TEXT 
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @ApiPropertyOptional({ description: '메시지 메타데이터' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MessageMetadataDto)
  metadata?: MessageMetadataDto;
}

export class CreateChatRoomDto {
  @ApiProperty({ description: '상대방 사용자 ID' })
  @IsUUID()
  @IsNotEmpty()
  participantId!: string;

  @ApiPropertyOptional({ description: '채팅방 이름' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ 
    description: '채팅방 타입',
    enum: ChatRoomType,
    default: ChatRoomType.DIRECT 
  })
  @IsOptional()
  @IsEnum(ChatRoomType)
  type?: ChatRoomType = ChatRoomType.DIRECT;
}

export class UpdateMessageDto {
  @ApiProperty({ description: '수정할 메시지 내용' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class ChatRoomQueryDto {
  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지 크기', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: '채팅방 상태',
    enum: ChatRoomStatus 
  })
  @IsOptional()
  @IsEnum(ChatRoomStatus)
  status?: ChatRoomStatus;
}

export class MessageQueryDto {
  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지 크기', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ description: '기준 메시지 ID (이전 메시지 로드용)' })
  @IsOptional()
  @IsUUID()
  beforeMessageId?: string;
}

export class MessageResponseDto {
  @ApiProperty({ description: '메시지 ID' })
  id!: string;

  @ApiProperty({ description: '메시지 내용' })
  content!: string;

  @ApiProperty({ description: '메시지 타입', enum: MessageType })
  type!: MessageType;

  @ApiProperty({ description: '메시지 상태', enum: MessageStatus })
  status!: MessageStatus;

  @ApiProperty({ description: '발신자 정보' })
  sender!: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };

  @ApiPropertyOptional({ description: '메시지 메타데이터' })
  metadata?: MessageMetadataDto;

  @ApiPropertyOptional({ description: '읽음 시간' })
  readAt?: Date;

  @ApiPropertyOptional({ description: '전송 시간' })
  deliveredAt?: Date;

  @ApiPropertyOptional({ description: '수정 시간' })
  editedAt?: Date;

  @ApiProperty({ description: '삭제 여부' })
  isDeleted!: boolean;

  @ApiProperty({ description: '생성 시간' })
  createdAt!: Date;

  @ApiProperty({ description: '수정 시간' })
  updatedAt!: Date;
}

export class ChatRoomResponseDto {
  @ApiProperty({ description: '채팅방 ID' })
  id!: string;

  @ApiPropertyOptional({ description: '채팅방 이름' })
  name?: string;

  @ApiProperty({ description: '채팅방 타입', enum: ChatRoomType })
  type!: ChatRoomType;

  @ApiProperty({ description: '채팅방 상태', enum: ChatRoomStatus })
  status!: ChatRoomStatus;

  @ApiProperty({ description: '상대방 정보' })
  otherParticipant!: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };

  @ApiPropertyOptional({ description: '마지막 메시지' })
  lastMessage?: string;

  @ApiPropertyOptional({ description: '마지막 메시지 시간' })
  lastMessageAt?: Date;

  @ApiProperty({ description: '읽지 않은 메시지 수' })
  unreadCount!: number;

  @ApiProperty({ description: '생성 시간' })
  createdAt!: Date;

  @ApiProperty({ description: '수정 시간' })
  updatedAt!: Date;
}

export class ChatRoomListResponseDto {
  @ApiProperty({ description: '채팅방 목록', type: [ChatRoomResponseDto] })
  chatRooms!: ChatRoomResponseDto[];

  @ApiProperty({ description: '전체 개수' })
  total!: number;

  @ApiProperty({ description: '현재 페이지' })
  page!: number;

  @ApiProperty({ description: '페이지 크기' })
  limit!: number;

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext!: boolean;
}

export class MessageListResponseDto {
  @ApiProperty({ description: '메시지 목록', type: [MessageResponseDto] })
  messages!: MessageResponseDto[];

  @ApiProperty({ description: '전체 개수' })
  total!: number;

  @ApiProperty({ description: '현재 페이지' })
  page!: number;

  @ApiProperty({ description: '페이지 크기' })
  limit!: number;

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext!: boolean;
}