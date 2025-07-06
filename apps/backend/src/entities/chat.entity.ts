import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Enum } from '@mikro-orm/core';
import { User } from './user.entity';
import { Message } from './message.entity';
import { ChatParticipant } from './chat-participant.entity';
import { v4 as uuidv4 } from 'uuid';

export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
  SPOT = 'spot',
}

@Entity()
export class Chat {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  name?: string;

  @Enum(() => ChatType)
  type: ChatType;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  avatar?: string;

  @Property({ nullable: true })
  spotId?: string; // For spot-based chats

  @ManyToOne(() => User, { nullable: true })
  createdBy?: User;

  @OneToMany(() => Message, message => message.chat)
  messages = new Collection<Message>(this);

  @OneToMany(() => ChatParticipant, participant => participant.chat)
  participants = new Collection<ChatParticipant>(this);

  @Property({ nullable: true })
  lastMessage?: string;

  @Property({ nullable: true })
  lastMessageAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(type: ChatType, createdBy?: User) {
    this.type = type;
    this.createdBy = createdBy;
  }
}