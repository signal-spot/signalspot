import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RateLimitGuard, RateLimit } from '../common/guards/rate-limit.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { ChatService } from './chat.service';
import {
  SendMessageDto,
  CreateChatRoomDto,
  UpdateMessageDto,
  ChatRoomQueryDto,
  MessageQueryDto,
  ChatRoomResponseDto,
  MessageResponseDto,
  ChatRoomListResponseDto,
  MessageListResponseDto,
} from './dto/chat.dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 requests per minute
  @ApiOperation({ summary: 'Create new chat room' })
  @ApiResponse({
    status: 201,
    description: 'Chat room created successfully',
    type: ChatRoomResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async createChatRoom(
    @GetUser() user: User,
    @Body() createChatRoomDto: CreateChatRoomDto,
  ): Promise<ChatRoomResponseDto> {
    return this.chatService.createChatRoom(user.id, createChatRoomDto);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get user chat rooms' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Chat room status filter' })
  @ApiResponse({
    status: 200,
    description: 'Chat rooms retrieved successfully',
    type: ChatRoomListResponseDto,
  })
  async getChatRooms(
    @GetUser() user: User,
    @Query() query: ChatRoomQueryDto,
  ): Promise<ChatRoomListResponseDto> {
    return this.chatService.getChatRooms(user.id, query);
  }

  @Get('rooms/:roomId')
  @ApiOperation({ summary: 'Get chat room by ID' })
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiResponse({
    status: 200,
    description: 'Chat room retrieved successfully',
    type: ChatRoomResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getChatRoomById(
    @GetUser() user: User,
    @Param('roomId') roomId: string,
  ): Promise<ChatRoomResponseDto> {
    return this.chatService.getChatRoomById(user.id, roomId);
  }

  @Post('messages')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 100, windowMs: 60 * 1000 }) // 100 messages per minute
  @ApiOperation({ summary: 'Send message' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid message data' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 429, description: 'Too many messages' })
  async sendMessage(
    @GetUser() user: User,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    return this.chatService.sendMessage(user.id, sendMessageDto);
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get messages in chat room' })
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Messages per page' })
  @ApiQuery({ name: 'beforeMessageId', required: false, description: 'Load messages before this ID' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: MessageListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getMessages(
    @GetUser() user: User,
    @Param('roomId') roomId: string,
    @Query() query: MessageQueryDto,
  ): Promise<MessageListResponseDto> {
    return this.chatService.getMessages(user.id, roomId, query);
  }

  @Put('rooms/:roomId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read successfully',
  })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async markAsRead(
    @GetUser() user: User,
    @Param('roomId') roomId: string,
  ): Promise<{ message: string }> {
    await this.chatService.markAsRead(user.id, roomId);
    return { message: 'Messages marked as read successfully' };
  }

  @Put('messages/:messageId')
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 20, windowMs: 60 * 1000 }) // 20 updates per minute
  @ApiOperation({ summary: 'Update message' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 429, description: 'Too many updates' })
  async updateMessage(
    @GetUser() user: User,
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.chatService.updateMessage(user.id, messageId, updateMessageDto);
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 20, windowMs: 60 * 1000 }) // 20 deletions per minute
  @ApiOperation({ summary: 'Delete message' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 429, description: 'Too many deletions' })
  async deleteMessage(
    @GetUser() user: User,
    @Param('messageId') messageId: string,
  ): Promise<{ message: string }> {
    await this.chatService.deleteMessage(user.id, messageId);
    return { message: 'Message deleted successfully' };
  }

  @Put('rooms/:roomId/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive chat room' })
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiResponse({
    status: 200,
    description: 'Chat room archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async archiveChatRoom(
    @GetUser() user: User,
    @Param('roomId') roomId: string,
  ): Promise<{ message: string }> {
    await this.chatService.archiveChatRoom(user.id, roomId);
    return { message: 'Chat room archived successfully' };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for chat service' })
  @ApiResponse({ status: 200, description: 'Chat service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      service: 'chat',
      timestamp: new Date().toISOString(),
    };
  }
}