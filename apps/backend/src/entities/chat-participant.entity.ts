import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { User } from './user.entity';
import { Chat } from './chat.entity';
import { v4 as uuidv4 } from 'uuid';

export enum ParticipantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity()
export class ChatParticipant {
  @PrimaryKey()
  id: string = uuidv4();

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Chat)
  chat: Chat;

  @Enum(() => ParticipantRole)
  role: ParticipantRole = ParticipantRole.MEMBER;

  @Property({ nullable: true })
  nickname?: string;

  @Property({ default: false })
  isMuted: boolean = false;

  @Property({ nullable: true })
  mutedUntil?: Date;

  @Property({ nullable: true })
  joinedAt: Date = new Date();

  @Property({ nullable: true })
  leftAt?: Date;

  @Property({ nullable: true })
  lastSeenAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(user: User, chat: Chat, role: ParticipantRole = ParticipantRole.MEMBER) {
    this.user = user;
    this.chat = chat;
    this.role = role;
  }
}