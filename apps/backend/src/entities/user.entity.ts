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

export class ProfileImage {
  private constructor(private readonly url: string) {}

  static create(url: string): ProfileImage {
    if (!url) {
      throw new Error('Profile image URL is required');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid profile image URL format');
    }

    return new ProfileImage(url);
  }

  toString(): string {
    return this.url;
  }

  equals(other: ProfileImage): boolean {
    return this.url === other.url;
  }

  isSecureUrl(): boolean {
    return this.url.startsWith('https://');
  }
}

export class Bio {
  private constructor(private readonly content: string) {}

  static create(content: string): Bio {
    if (!content) {
      return new Bio('');
    }

    const trimmed = content.trim();
    if (trimmed.length > 500) {
      throw new Error('Bio cannot exceed 500 characters');
    }

    return new Bio(trimmed);
  }

  toString(): string {
    return this.content;
  }

  equals(other: Bio): boolean {
    return this.content === other.content;
  }

  isEmpty(): boolean {
    return this.content.length === 0;
  }

  getWordCount(): number {
    return this.content.split(/\s+/).filter(word => word.length > 0).length;
  }
}

export class PhoneNumber {
  private constructor(private readonly number: string) {}

  static create(number: string): PhoneNumber {
    if (!number) {
      throw new Error('Phone number is required');
    }

    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }

    return new PhoneNumber(cleaned);
  }

  toString(): string {
    return this.number;
  }

  equals(other: PhoneNumber): boolean {
    return this.number === other.number;
  }

  getFormattedNumber(): string {
    // Format for Korean phone numbers
    if (this.number.length === 11 && this.number.startsWith('010')) {
      return `${this.number.slice(0, 3)}-${this.number.slice(3, 7)}-${this.number.slice(7)}`;
    }
    return this.number;
  }
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

export enum ProfileVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
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

export class UserProfileCompletedEvent extends DomainEvent {
  constructor(
    readonly userId: UserId,
    readonly completionPercentage: number,
  ) {
    super();
  }
}

export class UserProfileVerifiedEvent extends DomainEvent {
  constructor(
    readonly userId: UserId,
    readonly verificationType: string,
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
@Index({ properties: ['lastKnownLatitude', 'lastKnownLongitude', 'lastLocationUpdateAt'] }) // Spatial location queries
@Index({ properties: ['status', 'isActive'] }) // User status queries
@Index({ properties: ['profileCompletionPercentage', 'verificationStatus'] }) // Profile completion queries
@Index({ properties: ['locationPrivacy', 'locationTrackingEnabled'] }) // Location privacy queries
@Index({ properties: ['lastLoginAt', 'isActive'] }) // Active user queries
export class User extends AggregateRoot {
  @PrimaryKey({ type: 'uuid' })
  @Index()
  id: string;

  @Property({ unique: true })
  @Index()
  email: string;

  @Property({ unique: true })
  @Index()
  username: string;

  @Property()
  password: string;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ nullable: true, length: 500 })
  bio?: string;

  @Property({ nullable: true })
  phoneNumber?: string;

  @Property({ nullable: true })
  dateOfBirth?: Date;

  @Property({ nullable: true })
  gender?: string;

  @Property({ nullable: true })
  occupation?: string;

  @Property({ nullable: true })
  company?: string;

  @Property({ nullable: true })
  school?: string;

  @Property({ nullable: true })
  website?: string;

  @Property({ nullable: true })
  location?: string;

  @Property({ type: 'string', default: ProfileVisibility.PUBLIC })
  profileVisibility: ProfileVisibility = ProfileVisibility.PUBLIC;

  @Property({ type: 'string', default: ProfileVerificationStatus.UNVERIFIED })
  verificationStatus: ProfileVerificationStatus = ProfileVerificationStatus.UNVERIFIED;

  @Property({ type: 'json', nullable: true })
  verificationData?: {
    type?: string;
    documentUrl?: string;
    verifiedAt?: Date;
    verifierId?: string;
    rejectionReason?: string;
  };

  @Property({ type: 'json', nullable: true })
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  @Property({ type: 'json', nullable: true })
  interests?: string[];

  @Property({ type: 'json', nullable: true })
  skills?: string[];

  @Property({ type: 'json', nullable: true })
  languages?: string[];

  @Property({ type: 'boolean', default: false })
  isPublicProfile = false;

  @Property({ type: 'boolean', default: false })
  allowMessagesFromStrangers = false;

  @Property({ type: 'boolean', default: true })
  showOnlineStatus = true;

  @Property({ type: 'boolean', default: true })
  showProfileViewers = true;

  @Property({ type: 'number', default: 0 })
  profileViews = 0;

  @Property({ type: 'date', nullable: true })
  lastProfileUpdateAt?: Date;

  @Property({ type: 'number', default: 0 })
  profileCompletionPercentage = 0;

  @Property({ type: 'json', nullable: true })
  profileAnalytics?: {
    totalViews?: number;
    uniqueViews?: number;
    viewsThisMonth?: number;
    searchAppearances?: number;
    profileClicks?: number;
    lastAnalyticsUpdate?: Date;
  };

  @Property({ type: 'boolean', default: true })
  isActive = true;

  @Property({ type: 'string', default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus = UserStatus.PENDING_VERIFICATION;

  @Property({ nullable: true })
  @Index()
  lastLoginAt?: Date;

  @Property({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  // Location-related properties
  @Property({ type: 'boolean', default: false })
  @Index()
  locationTrackingEnabled = false;

  @Property({ type: 'string', default: 'private' })
  @Index()
  locationPrivacy = 'private'; // 'public', 'friends', 'private'

  @Property({ type: 'double', nullable: true })
  @Index()
  lastKnownLatitude?: number;

  @Property({ type: 'double', nullable: true })
  @Index()
  lastKnownLongitude?: number;

  @Property({ type: 'date', nullable: true })
  @Index()
  lastLocationUpdateAt?: Date;

  @Property({ type: 'json', nullable: true })
  locationPreferences?: {
    shareWithFriends?: boolean;
    shareForSignalSpots?: boolean;
    shareForSignalSpark?: boolean;
    maxSharingDistance?: number; // in kilometers
    backgroundLocationEnabled?: boolean;
    highAccuracyEnabled?: boolean;
    locationHistoryEnabled?: boolean;
    locationHistoryDays?: number;
    nearbyNotificationsEnabled?: boolean;
    nearbyNotificationRadius?: number; // in kilometers
  };

  @Property({ type: 'number', default: 0 })
  reportedCount = 0;

  @Property({ default: false })
  isEmailVerified = false;

  @Property({ nullable: true })
  emailVerifiedAt?: Date;

  @Property({ default: 0 })
  loginAttempts = 0;

  @Property({ default: false })
  accountLocked = false;

  @Property({ nullable: true })
  fcmToken?: string;

  @Property({ nullable: true })
  lockedUntil?: Date;

  @Property({ nullable: true })
  emailVerificationToken?: string;

  @Property({ nullable: true })
  passwordResetToken?: string;

  @Property({ nullable: true })
  passwordResetExpires?: Date;

  @Property({ nullable: true })
  lastLogoutAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Rich Domain Model Constructor
  private constructor() {
    super();
    this.id = v4();
  }

  // Factory method for creating new users
  static create(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    isEmailVerified?: boolean;
    loginAttempts?: number;
    accountLocked?: boolean;
  }): User {
    const user = new User();
    
    // Validate using value objects but store as strings
    Email.create(data.email); // Validates email format
    Username.create(data.username); // Validates username format
    
    user.email = data.email;
    user.username = data.username;
    user.password = data.password;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.isEmailVerified = data.isEmailVerified ?? false;
    user.loginAttempts = data.loginAttempts ?? 0;
    user.accountLocked = data.accountLocked ?? false;
    user.createdAt = new Date();
    
    // Emit domain event
    user.addDomainEvent(new UserCreatedEvent(UserId.fromString(user.id), Email.create(user.email)));
    
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
    phoneNumber?: string;
    dateOfBirth?: Date;
    gender?: string;
    occupation?: string;
    company?: string;
    school?: string;
    website?: string;
    location?: string;
    socialLinks?: {
      instagram?: string;
      twitter?: string;
      facebook?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
    };
    interests?: string[];
    skills?: string[];
    languages?: string[];
  }): void {
    const oldCompletionPercentage = this.profileCompletionPercentage;

    if (changes.firstName !== undefined) {
      this.firstName = changes.firstName;
    }
    if (changes.lastName !== undefined) {
      this.lastName = changes.lastName;
    }
    if (changes.bio !== undefined) {
      // Validate bio using value object
      Bio.create(changes.bio);
      this.bio = changes.bio;
    }
    if (changes.avatarUrl !== undefined) {
      // Validate profile image URL using value object
      if (changes.avatarUrl) {
        ProfileImage.create(changes.avatarUrl);
      }
      this.avatarUrl = changes.avatarUrl;
    }
    if (changes.phoneNumber !== undefined) {
      if (changes.phoneNumber) {
        PhoneNumber.create(changes.phoneNumber);
      }
      this.phoneNumber = changes.phoneNumber;
    }
    if (changes.dateOfBirth !== undefined) {
      this.dateOfBirth = changes.dateOfBirth;
    }
    if (changes.gender !== undefined) {
      this.gender = changes.gender;
    }
    if (changes.occupation !== undefined) {
      this.occupation = changes.occupation;
    }
    if (changes.company !== undefined) {
      this.company = changes.company;
    }
    if (changes.school !== undefined) {
      this.school = changes.school;
    }
    if (changes.website !== undefined) {
      this.website = changes.website;
    }
    if (changes.location !== undefined) {
      this.location = changes.location;
    }
    if (changes.socialLinks !== undefined) {
      this.socialLinks = {
        ...this.socialLinks,
        ...changes.socialLinks
      };
    }
    if (changes.interests !== undefined) {
      this.interests = changes.interests;
    }
    if (changes.skills !== undefined) {
      this.skills = changes.skills;
    }
    if (changes.languages !== undefined) {
      this.languages = changes.languages;
    }

    this.lastProfileUpdateAt = new Date();
    this.updatedAt = new Date();

    // Calculate new completion percentage
    const newCompletionPercentage = this.calculateProfileCompletionPercentage();
    this.profileCompletionPercentage = newCompletionPercentage;

    this.addDomainEvent(new UserProfileUpdatedEvent(
      UserId.fromString(this.id),
      changes,
    ));

    // Emit profile completion event if percentage changed significantly
    if (Math.abs(newCompletionPercentage - oldCompletionPercentage) >= 10) {
      this.addDomainEvent(new UserProfileCompletedEvent(
        UserId.fromString(this.id),
        newCompletionPercentage,
      ));
    }
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

  // Location-related business methods
  public enableLocationTracking(): void {
    this.locationTrackingEnabled = true;
    this.updatedAt = new Date();
  }

  public disableLocationTracking(): void {
    this.locationTrackingEnabled = false;
    this.updatedAt = new Date();
  }

  public updateLocationPrivacy(privacy: 'public' | 'friends' | 'private'): void {
    this.locationPrivacy = privacy;
    this.updatedAt = new Date();
  }

  public updateLastKnownLocation(latitude: number, longitude: number): void {
    this.lastKnownLatitude = latitude;
    this.lastKnownLongitude = longitude;
    this.lastLocationUpdateAt = new Date();
    this.updatedAt = new Date();
  }

  public updateLocationPreferences(preferences: {
    shareWithFriends?: boolean;
    shareForSignalSpots?: boolean;
    shareForSignalSpark?: boolean;
    maxSharingDistance?: number;
    backgroundLocationEnabled?: boolean;
    highAccuracyEnabled?: boolean;
    locationHistoryEnabled?: boolean;
    locationHistoryDays?: number;
    nearbyNotificationsEnabled?: boolean;
    nearbyNotificationRadius?: number;
  }): void {
    this.locationPreferences = {
      ...this.locationPreferences,
      ...preferences
    };
    this.updatedAt = new Date();
  }

  public canShareLocationWith(other: User): boolean {
    if (this.locationPrivacy === 'public') {
      return true;
    }
    
    if (this.locationPrivacy === 'private') {
      return false;
    }
    
    if (this.locationPrivacy === 'friends') {
      // TODO: Implement friend relationship check
      return false;
    }
    
    return false;
  }

  public hasRecentLocation(minutesThreshold = 30): boolean {
    if (!this.lastLocationUpdateAt) return false;
    
    const now = new Date();
    const diffMinutes = (now.getTime() - this.lastLocationUpdateAt.getTime()) / (1000 * 60);
    return diffMinutes <= minutesThreshold;
  }

  public canReceiveLocationBasedNotifications(): boolean {
    return this.locationPreferences?.nearbyNotificationsEnabled ?? false;
  }

  public getLocationSharingRadius(): number {
    return this.locationPreferences?.maxSharingDistance ?? 5; // Default 5km
  }

  public getNotificationRadius(): number {
    return this.locationPreferences?.nearbyNotificationRadius ?? 1; // Default 1km
  }

  // Profile-specific business methods
  public updateProfileVisibility(visibility: ProfileVisibility): void {
    this.profileVisibility = visibility;
    this.updatedAt = new Date();
  }

  public updateProfileSettings(settings: {
    isPublicProfile?: boolean;
    allowMessagesFromStrangers?: boolean;
    showOnlineStatus?: boolean;
    showProfileViewers?: boolean;
  }): void {
    if (settings.isPublicProfile !== undefined) {
      this.isPublicProfile = settings.isPublicProfile;
    }
    if (settings.allowMessagesFromStrangers !== undefined) {
      this.allowMessagesFromStrangers = settings.allowMessagesFromStrangers;
    }
    if (settings.showOnlineStatus !== undefined) {
      this.showOnlineStatus = settings.showOnlineStatus;
    }
    if (settings.showProfileViewers !== undefined) {
      this.showProfileViewers = settings.showProfileViewers;
    }

    this.updatedAt = new Date();
  }

  public requestProfileVerification(type: string, documentUrl: string): void {
    if (this.verificationStatus === ProfileVerificationStatus.VERIFIED) {
      throw new Error('Profile is already verified');
    }

    this.verificationStatus = ProfileVerificationStatus.PENDING;
    this.verificationData = {
      type,
      documentUrl,
    };
    this.updatedAt = new Date();
  }

  public verifyProfile(verifierId: string): void {
    if (this.verificationStatus !== ProfileVerificationStatus.PENDING) {
      throw new Error('Profile verification is not pending');
    }

    this.verificationStatus = ProfileVerificationStatus.VERIFIED;
    this.verificationData = {
      ...this.verificationData,
      verifiedAt: new Date(),
      verifierId,
    };
    this.updatedAt = new Date();

    this.addDomainEvent(new UserProfileVerifiedEvent(
      UserId.fromString(this.id),
      this.verificationData.type || 'unknown',
    ));
  }

  public rejectProfileVerification(reason: string): void {
    if (this.verificationStatus !== ProfileVerificationStatus.PENDING) {
      throw new Error('Profile verification is not pending');
    }

    this.verificationStatus = ProfileVerificationStatus.REJECTED;
    this.verificationData = {
      ...this.verificationData,
      rejectionReason: reason,
    };
    this.updatedAt = new Date();
  }

  public incrementProfileViews(): void {
    this.profileViews += 1;
    
    // Update analytics
    const currentAnalytics = this.profileAnalytics || {};
    this.profileAnalytics = {
      ...currentAnalytics,
      totalViews: (currentAnalytics.totalViews || 0) + 1,
      viewsThisMonth: (currentAnalytics.viewsThisMonth || 0) + 1,
      lastAnalyticsUpdate: new Date(),
    };
    
    this.updatedAt = new Date();
  }

  public calculateProfileCompletionPercentage(): number {
    const fields = [
      this.firstName,
      this.lastName,
      this.bio,
      this.avatarUrl,
      this.phoneNumber,
      this.dateOfBirth,
      this.occupation,
      this.location,
    ];

    const optionalFields = [
      this.company,
      this.school,
      this.website,
      this.interests?.length > 0,
      this.skills?.length > 0,
      this.languages?.length > 0,
    ];

    const completedRequiredFields = fields.filter(field => field !== null && field !== undefined && field !== '').length;
    const completedOptionalFields = optionalFields.filter(field => field).length;

    const requiredWeight = 0.8;
    const optionalWeight = 0.2;

    const requiredScore = (completedRequiredFields / fields.length) * requiredWeight;
    const optionalScore = (completedOptionalFields / optionalFields.length) * optionalWeight;

    return Math.round((requiredScore + optionalScore) * 100);
  }

  public isProfileComplete(): boolean {
    return this.calculateProfileCompletionPercentage() >= 80;
  }

  public canViewProfile(viewer: User): boolean {
    if (this.profileVisibility === ProfileVisibility.PUBLIC) {
      return true;
    }

    if (this.profileVisibility === ProfileVisibility.PRIVATE) {
      return this.id === viewer.id;
    }

    if (this.profileVisibility === ProfileVisibility.FRIENDS) {
      // TODO: Implement friend relationship check
      return this.id === viewer.id;
    }

    return false;
  }

  public getAge(): number | null {
    if (!this.dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  public getProfileSummary(): {
    completionPercentage: number;
    isVerified: boolean;
    totalViews: number;
    isComplete: boolean;
    lastUpdated: Date | null;
  } {
    return {
      completionPercentage: this.profileCompletionPercentage,
      isVerified: this.verificationStatus === ProfileVerificationStatus.VERIFIED,
      totalViews: this.profileViews,
      isComplete: this.isProfileComplete(),
      lastUpdated: this.lastProfileUpdateAt,
    };
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