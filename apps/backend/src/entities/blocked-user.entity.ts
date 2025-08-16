import { Entity, PrimaryKey, Property, ManyToOne, Index, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';

@Entity()
@Index({ properties: ['blocker', 'blocked'] })
@Unique({ properties: ['blocker', 'blocked'] })
export class BlockedUser {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  blocker!: User; // The user who is blocking

  @ManyToOne(() => User)
  blocked!: User; // The user who is being blocked

  @Property({ nullable: true })
  reason?: string; // Optional reason for blocking

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}