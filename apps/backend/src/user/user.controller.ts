import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { BlockService } from './services/block.service';
import { BlockUserDto } from './dto/block-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, VerifiedUserGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly blockService: BlockService) {}

  @Post('block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Block a user',
    description: 'Blocks another user, preventing them from interacting with you.'
  })
  @ApiBody({ type: BlockUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User blocked successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot block yourself'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User already blocked'
  })
  async blockUser(
    @Body() blockUserDto: BlockUserDto,
    @GetUser() user: User
  ): Promise<{ success: boolean; message: string }> {

    await this.blockService.blockUser(
      user.id,
      blockUserDto.userId,
      blockUserDto.reason
    );

    return {
      success: true,
      message: 'User blocked successfully',
    };
  }

  @Delete('block/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Unblock a user',
    description: 'Unblocks a previously blocked user.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID of the user to unblock',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User unblocked successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User is not blocked'
  })
  async unblockUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @GetUser() user: User
  ): Promise<{ success: boolean; message: string }> {
    await this.blockService.unblockUser(user.id, userId);

    return {
      success: true,
      message: 'User unblocked successfully',
    };
  }

  @Get('blocked')
  @ApiOperation({ 
    summary: 'Get blocked users',
    description: 'Retrieves the list of users you have blocked.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of blocked users retrieved successfully'
  })
  async getBlockedUsers(
    @GetUser() user: User
  ): Promise<{ success: boolean; data: User[] }> {
    const blockedUsers = await this.blockService.getBlockedUsers(user.id);

    return {
      success: true,
      data: blockedUsers,
    };
  }

  @Get('block-stats')
  @ApiOperation({ 
    summary: 'Get block statistics',
    description: 'Retrieves statistics about blocked users.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Block statistics retrieved successfully'
  })
  async getBlockStats(
    @GetUser() user: User
  ): Promise<{ 
    success: boolean; 
    data: { blockedCount: number; blockedByCount: number } 
  }> {
    const stats = await this.blockService.getBlockStats(user.id);

    return {
      success: true,
      data: stats,
    };
  }

  @Get('is-blocked/:userId')
  @ApiOperation({ 
    summary: 'Check if user is blocked',
    description: 'Checks if you have blocked a specific user.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID of the user to check',
    format: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Block status retrieved successfully'
  })
  async isBlocked(
    @Param('userId', ParseUUIDPipe) userId: string,
    @GetUser() user: User
  ): Promise<{ success: boolean; data: { isBlocked: boolean } }> {
    const isBlocked = await this.blockService.isBlocked(user.id, userId);

    return {
      success: true,
      data: { isBlocked },
    };
  }
}