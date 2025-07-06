import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Enum } from '@mikro-orm/core';
import { User } from './user.entity';
import { Chat } from './chat.entity';
import { MessageRead } from './message-read.entity';
import { v4 as uuidv4 } from 'uuid';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

@Entity()
export class Message {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  content: string;

  @Enum(() => MessageType)
  type: MessageType = MessageType.TEXT;

  @Property({ type: 'json', nullable: true })
  metadata?: any; // For storing file info, image dimensions, etc.

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => Chat)
  chat: Chat;

  @OneToMany(() => MessageRead, read => read.message)
  reads = new Collection<MessageRead>(this);

  @Property({ nullable: true })
  replyTo?: string; // Message ID being replied to

  @Property({ default: false })
  isEdited: boolean = false;

  @Property({ nullable: true })
  editedAt?: Date;

  @Property({ default: false })
  isDeleted: boolean = false;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(content: string, sender: User, chat: Chat, type: MessageType = MessageType.TEXT) {
    this.content = content;
    this.sender = sender;
    this.chat = chat;
    this.type = type;
  }
}