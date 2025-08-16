import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Enum,
  Index,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';
import { Message } from './message.entity';

export enum ChatRoomType {
  DIRECT = 'direct',
  GROUP = 'group',
}

export enum ChatRoomStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
}

@Entity()
@Index({ properties: ['participant1', 'participant2'] })
@Index({ properties: ['type', 'status'] })
export class ChatRoom {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name?: string;

  @Enum(() => ChatRoomType)
  type: ChatRoomType = ChatRoomType.DIRECT;

  @Enum(() => ChatRoomStatus)
  status: ChatRoomStatus = ChatRoomStatus.ACTIVE;

  @Property({ nullable: true })
  sparkId?: string; // 스파크로 생성된 채팅방인 경우 스파크 ID

  @Property({ nullable: true })
  initiatedBy?: 'spark' | 'direct' | 'signalspot'; // 채팅방 생성 방식

  @ManyToOne(() => User)
  participant1!: User;

  @ManyToOne(() => User)
  participant2!: User;

  @OneToMany(() => Message, message => message.chatRoom)
  messages = new Collection<Message>(this);

  @Property({ nullable: true })
  lastMessageAt?: Date;

  @Property({ nullable: true })
  lastMessage?: string;

  @Property()
  unreadCount1: number = 0; // participant1의 읽지 않은 메시지 수

  @Property()
  unreadCount2: number = 0; // participant2의 읽지 않은 메시지 수

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Helper methods
  getUnreadCountForUser(userId: string): number {
    if (this.participant1.id === userId) {
      return this.unreadCount1;
    } else if (this.participant2.id === userId) {
      return this.unreadCount2;
    }
    return 0;
  }

  getOtherParticipant(currentUserId: string): User {
    return this.participant1.id === currentUserId ? this.participant2 : this.participant1;
  }

  updateLastMessage(message: string, senderId: string): void {
    this.lastMessage = message;
    this.lastMessageAt = new Date();
    
    // 발신자가 아닌 사용자의 읽지 않은 메시지 카운트 증가
    if (this.participant1.id !== senderId) {
      this.unreadCount1++;
    }
    if (this.participant2.id !== senderId) {
      this.unreadCount2++;
    }
  }

  markAsRead(userId: string): void {
    if (this.participant1.id === userId) {
      this.unreadCount1 = 0;
    } else if (this.participant2.id === userId) {
      this.unreadCount2 = 0;
    }
  }
}