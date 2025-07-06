import { Entity, PrimaryKey, Property, Unique, Index } from '@mikro-orm/core';
import { v4 } from 'uuid';

// Value Objects
export class UserId {
  private constructor(private readonly value: string) {}

  static generate(): UserId {
    return new UserId(v4());
  }

  static fromString(value: string): UserId {
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid UserId');
    }
    return new UserId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!email) {
      throw new Error('Email is required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    if (!this.isValidFormat(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    return new Email(trimmedEmail);
  }

  private static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export class Username {
  private constructor(private readonly value: string) {}

  static create(username: string): Username {
    if (!username || username.length < 3 || username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    return new Username(username);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}

export enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

// Domain Events
export abstract class DomainEvent {
  readonly occurredOn: Date = new Date();
  readonly eventId: string = v4();
}

export class UserCreatedEvent extends DomainEvent {
  constructor(
    readonly userId: UserId,
    readonly email: Email,
  ) {
    super();
  }
}

export class UserVerifiedEvent extends DomainEvent {
  constructor(readonly userId: UserId) {
    super();
  }
}

export class UserProfileUpdatedEvent extends DomainEvent {
  constructor(
    readonly userId: UserId,
    readonly changes: Record<string, any>,
  ) {
    super();
  }
}

// Aggregate Root Base
export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  markEventsAsCommitted(): void {
    this._domainEvents = [];
  }
}

// Rich Domain Entity
@Entity()
export class User extends AggregateRoot {
  @PrimaryKey({ type: 'uuid' })
  id: string;

  @Property({ unique: true })
  @Index()
  email!: string;

  @Property({ unique: true })
  @Index()
  username!: string;

  @Property()
  password!: string;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ nullable: true })
  bio?: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ type: 'string', default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus = UserStatus.PENDING_VERIFICATION;

  @Property({ nullable: true })
  @Index()
  lastLoginAt?: Date;

  @Property({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  @Property({ type: 'number', default: 0 })
  reportedCount: number = 0;

  @Property({ type: 'date' })
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Rich Domain Model Constructor
  private constructor() {
    super();
    this.id = v4();
  }

  // Factory Method
  static create(props: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): User {
    // Create value objects for validation
    const email = Email.create(props.email);
    const username = Username.create(props.username);

    // Create user instance
    const user = new User();
    user.email = email.toString();
    user.username = username.toString();
    user.password = props.password; // Should be hashed by application service
    user.firstName = props.firstName;
    user.lastName = props.lastName;
    user.status = UserStatus.PENDING_VERIFICATION;

    // Add domain event
    user.addDomainEvent(new UserCreatedEvent(
      UserId.fromString(user.id),
      email,
    ));

    return user;
  }

  // Business Logic Methods
  public verifyEmail(): void {
    if (this.status === UserStatus.VERIFIED) {
      throw new Error('User is already verified');
    }

    this.status = UserStatus.VERIFIED;
    this.updatedAt = new Date();

    this.addDomainEvent(new UserVerifiedEvent(
      UserId.fromString(this.id)
    ));
  }

  public updateProfile(changes: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  }): void {
    if (changes.firstName !== undefined) {
      this.firstName = changes.firstName;
    }
    if (changes.lastName !== undefined) {
      this.lastName = changes.lastName;
    }
    if (changes.bio !== undefined) {
      this.bio = changes.bio;
    }
    if (changes.avatarUrl !== undefined) {
      this.avatarUrl = changes.avatarUrl;
    }

    this.updatedAt = new Date();

    this.addDomainEvent(new UserProfileUpdatedEvent(
      UserId.fromString(this.id),
      changes,
    ));
  }

  public suspend(reason: string): void {
    if (this.status === UserStatus.SUSPENDED) {
      throw new Error('User is already suspended');
    }

    this.status = UserStatus.SUSPENDED;
    this.updatedAt = new Date();
  }

  public reactivate(): void {
    if (this.status !== UserStatus.SUSPENDED && this.status !== UserStatus.DEACTIVATED) {
      throw new Error('Can only reactivate suspended or deactivated users');
    }

    this.status = UserStatus.VERIFIED;
    this.updatedAt = new Date();
  }

  public recordLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  // Business Rule Methods
  public canCreateSignalSpot(): boolean {
    return this.status === UserStatus.VERIFIED && this.isActive;
  }

  public getFullName(): string {
    if (!this.firstName && !this.lastName) {
      return this.username;
    }
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }

  public isRecentlyActive(): boolean {
    if (!this.lastLoginAt) return false;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.lastLoginAt > thirtyDaysAgo;
  }

  // Value Object Getters
  public getUserId(): UserId {
    return UserId.fromString(this.id);
  }

  public getEmail(): Email {
    return Email.create(this.email);
  }

  public getUsername(): Username {
    return Username.create(this.username);
  }

  // Domain Properties
  get isVerified(): boolean {
    return this.status === UserStatus.VERIFIED;
  }

  get isSuspended(): boolean {
    return this.status === UserStatus.SUSPENDED;
  }

  get accountAge(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }
} 