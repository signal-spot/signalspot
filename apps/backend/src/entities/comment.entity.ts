import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { SignalSpot } from './signal-spot.entity';

@Entity({ tableName: 'comments' })
export class Comment extends BaseEntity {
  @ManyToOne(() => SignalSpot, { nullable: false })
  @Index()
  spot!: SignalSpot;

  @ManyToOne(() => User, { nullable: false })
  @Index()
  author!: User;

  @Property({ type: 'text' })
  content!: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: {
    isEdited?: boolean;
    editedAt?: Date;
    mentionedUsers?: string[];
    attachments?: string[];
  };

  @Property({ default: 0 })
  likeCount: number = 0;

  @Property({ 
    type: 'jsonb', 
    default: '[]',
    serializer: (value: string[]) => JSON.stringify(value || []),
    hydrate: (value: string | string[]) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
      return Array.isArray(value) ? value : [];
    }
  })
  likedBy: string[] = [];

  @Property({ default: false })
  isDeleted: boolean = false;

  @Property({ nullable: true })
  deletedAt?: Date;

  @Property({ nullable: true })
  parentCommentId?: string;

  @Property({ default: false })
  isAnonymous: boolean = false;

  // Helper methods
  isLikedBy(userId: string): boolean {
    if (!this.likedBy || !Array.isArray(this.likedBy)) {
      return false;
    }
    return this.likedBy.includes(userId);
  }

  toggleLike(userId: string): void {
    // Ensure likedBy is initialized as array
    if (!Array.isArray(this.likedBy)) {
      this.likedBy = [];
    }
    
    const index = this.likedBy.indexOf(userId);
    if (index > -1) {
      // Remove like
      this.likedBy.splice(index, 1);
      this.likeCount = Math.max(0, this.likeCount - 1);
    } else {
      // Add like
      this.likedBy.push(userId);
      this.likeCount++;
    }
  }

  addLike(userId: string): boolean {
    if (!Array.isArray(this.likedBy)) {
      this.likedBy = [];
    }
    
    if (!this.likedBy.includes(userId)) {
      this.likedBy.push(userId);
      this.likeCount++;
      return true; // Like was added
    }
    return false; // Already liked
  }

  removeLike(userId: string): boolean {
    if (!Array.isArray(this.likedBy)) {
      this.likedBy = [];
      return false;
    }
    
    const index = this.likedBy.indexOf(userId);
    if (index > -1) {
      this.likedBy.splice(index, 1);
      this.likeCount = Math.max(0, this.likeCount - 1);
      return true; // Like was removed
    }
    return false; // Wasn't liked
  }

  softDelete(): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.content = '[삭제된 댓글입니다]';
  }
}