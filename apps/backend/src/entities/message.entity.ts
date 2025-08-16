import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
  Index,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';
import { ChatRoom } from './chat-room.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  LOCATION = 'location',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity()
@Index({ properties: ['chatRoom', 'createdAt'] })
@Index({ properties: ['sender', 'createdAt'] })
export class Message {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => ChatRoom)
  chatRoom!: ChatRoom;

  @ManyToOne(() => User)
  sender!: User;

  @Property({ type: 'text' })
  content!: string;

  @Enum(() => MessageType)
  type: MessageType = MessageType.TEXT;

  @Enum(() => MessageStatus)
  status: MessageStatus = MessageStatus.SENT;

  @Property({ type: 'json', nullable: true })
  metadata?: {
    imageUrl?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    systemMessageType?: string;
  };

  @Property({ nullable: true })
  readAt?: Date;

  @Property({ nullable: true })
  deliveredAt?: Date;

  @Property({ nullable: true })
  editedAt?: Date;

  @Property()
  isDeleted: boolean = false;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Helper methods
  markAsDelivered(): void {
    if (this.status === MessageStatus.SENT) {
      this.status = MessageStatus.DELIVERED;
      this.deliveredAt = new Date();
    }
  }

  markAsRead(): void {
    if (this.status !== MessageStatus.READ) {
      this.status = MessageStatus.READ;
      this.readAt = new Date();
      if (!this.deliveredAt) {
        this.deliveredAt = new Date();
      }
    }
  }

  softDelete(): void {
    this.isDeleted = true;
  }

  edit(newContent: string): void {
    this.content = newContent;
    this.editedAt = new Date();
  }
}