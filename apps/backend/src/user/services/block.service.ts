import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../entities/user.entity';
import { BlockedUser } from '../../entities/blocked-user.entity';

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockService.name);

  constructor(
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepository: EntityRepository<BlockedUser>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Block a user
   */
  async blockUser(blockerId: string, blockedUserId: string, reason?: string): Promise<void> {
    // Check if users exist
    const blocker = await this.userRepository.findOne({ id: blockerId });
    const blockedUser = await this.userRepository.findOne({ id: blockedUserId });

    if (!blocker || !blockedUser) {
      throw new NotFoundException('User not found');
    }

    // Check if trying to block self
    if (blockerId === blockedUserId) {
      throw new BadRequestException('You cannot block yourself');
    }

    // Check if already blocked
    const existingBlock = await this.blockedUserRepository.findOne({
      blocker: blockerId,
      blocked: blockedUserId,
    });

    if (existingBlock) {
      throw new ConflictException('You have already blocked this user');
    }

    // Create the block relationship
    const blockedRelation = this.blockedUserRepository.create({
      blocker,
      blocked: blockedUser,
      reason,
    });

    await this.em.persistAndFlush(blockedRelation);

    // Emit event for other services to handle (e.g., remove from chat, cancel sparks, etc.)
    this.eventEmitter.emit('user.blocked', {
      blockerId,
      blockedUserId,
      timestamp: new Date(),
    });

    this.logger.log(`User ${blockerId} blocked user ${blockedUserId}`);
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const blockedRelation = await this.blockedUserRepository.findOne({
      blocker: blockerId,
      blocked: blockedUserId,
    });

    if (!blockedRelation) {
      throw new NotFoundException('This user is not blocked');
    }

    await this.em.removeAndFlush(blockedRelation);

    // Emit event
    this.eventEmitter.emit('user.unblocked', {
      blockerId,
      blockedUserId,
      timestamp: new Date(),
    });

    this.logger.log(`User ${blockerId} unblocked user ${blockedUserId}`);
  }

  /**
   * Get list of blocked users for a user
   */
  async getBlockedUsers(userId: string): Promise<User[]> {
    const blockedRelations = await this.blockedUserRepository.find(
      { blocker: userId },
      { populate: ['blocked'] }
    );

    return blockedRelations.map(relation => relation.blocked);
  }

  /**
   * Get list of users who have blocked a specific user
   */
  async getBlockedByUsers(userId: string): Promise<User[]> {
    const blockedRelations = await this.blockedUserRepository.find(
      { blocked: userId },
      { populate: ['blocker'] }
    );

    return blockedRelations.map(relation => relation.blocker);
  }

  /**
   * Check if a user has blocked another user
   */
  async isBlocked(blockerId: string, blockedUserId: string): Promise<boolean> {
    const blockedRelation = await this.blockedUserRepository.findOne({
      blocker: blockerId,
      blocked: blockedUserId,
    });

    return !!blockedRelation;
  }

  /**
   * Check if there's a mutual block (either user has blocked the other)
   */
  async isMutuallyBlocked(user1Id: string, user2Id: string): Promise<boolean> {
    const block1 = await this.isBlocked(user1Id, user2Id);
    const block2 = await this.isBlocked(user2Id, user1Id);
    
    return block1 || block2;
  }

  /**
   * Get block statistics for a user
   */
  async getBlockStats(userId: string): Promise<{
    blockedCount: number;
    blockedByCount: number;
  }> {
    const blockedCount = await this.blockedUserRepository.count({ blocker: userId });
    const blockedByCount = await this.blockedUserRepository.count({ blocked: userId });

    return {
      blockedCount,
      blockedByCount,
    };
  }
}