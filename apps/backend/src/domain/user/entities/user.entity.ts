import { AggregateRoot } from '../../shared/events/aggregate-root.base';
import { BusinessRuleViolationException } from '../../shared/exceptions/domain.exception';
import { UserId } from '../value-objects/user-id.value-object';
import { Email } from '../value-objects/email.value-object';
import { Username } from '../value-objects/username.value-object';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserVerifiedEvent } from '../events/user-verified.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';

export enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  locationSharing: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

export class User extends AggregateRoot {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _username: Username,
    private _passwordHash: string,
    private _status: UserStatus,
    private _profile: UserProfile,
    private _preferences: UserPreferences,
    private _failedLoginAttempts: number,
    private _lastLoginAt?: Date,
    private _verifiedAt?: Date,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    super();
  }

  static create(props: {
    email: string;
    username: string;
    passwordHash: string;
    profile?: Partial<UserProfile>;
    preferences?: Partial<UserPreferences>;
  }): User {
    const id = UserId.generate();
    const email = Email.create(props.email);
    const username = Username.create(props.username);

    const defaultProfile: UserProfile = {
      ...props.profile,
    };

    const defaultPreferences: UserPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      locationSharing: false,
      profileVisibility: 'public',
      language: 'ko',
      theme: 'auto',
      ...props.preferences,
    };

    const user = new User(
      id,
      email,
      username,
      props.passwordHash,
      UserStatus.PENDING_VERIFICATION,
      defaultProfile,
      defaultPreferences,
      0,
    );

    user.addDomainEvent(new UserCreatedEvent(id, email));
    return user;
  }

  static reconstitute(props: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    status: UserStatus;
    profile: UserProfile;
    preferences: UserPreferences;
    failedLoginAttempts: number;
    lastLoginAt?: Date;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      UserId.create(props.id),
      Email.create(props.email),
      Username.create(props.username),
      props.passwordHash,
      props.status,
      props.profile,
      props.preferences,
      props.failedLoginAttempts,
      props.lastLoginAt,
      props.verifiedAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  verify(): void {
    if (this._status === UserStatus.VERIFIED) {
      throw new BusinessRuleViolationException('User is already verified');
    }

    if (this._status !== UserStatus.PENDING_VERIFICATION) {
      throw new BusinessRuleViolationException('User must be in pending verification status to be verified');
    }

    this._status = UserStatus.VERIFIED;
    this._verifiedAt = new Date();
    this._updatedAt = new Date();

    this.addDomainEvent(new UserVerifiedEvent(this._id));
  }

  updateProfile(updates: Partial<UserProfile>): void {
    if (this._status === UserStatus.DEACTIVATED) {
      throw new BusinessRuleViolationException('Cannot update profile of deactivated user');
    }

    this._profile = { ...this._profile, ...updates };
    this._updatedAt = new Date();

    this.addDomainEvent(new UserProfileUpdatedEvent(this._id, updates));
  }

  updatePreferences(updates: Partial<UserPreferences>): void {
    this._preferences = { ...this._preferences, ...updates };
    this._updatedAt = new Date();
  }

  recordFailedLogin(): void {
    this._failedLoginAttempts += 1;
    this._updatedAt = new Date();

    if (this._failedLoginAttempts >= 5) {
      this.suspend();
    }
  }

  recordSuccessfulLogin(): void {
    this._failedLoginAttempts = 0;
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  suspend(): void {
    if (this._status === UserStatus.DEACTIVATED) {
      throw new BusinessRuleViolationException('Cannot suspend deactivated user');
    }

    this._status = UserStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  reactivate(): void {
    if (this._status !== UserStatus.SUSPENDED) {
      throw new BusinessRuleViolationException('Only suspended users can be reactivated');
    }

    this._status = UserStatus.VERIFIED;
    this._failedLoginAttempts = 0;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = UserStatus.DEACTIVATED;
    this._updatedAt = new Date();
  }

  changePassword(newPasswordHash: string): void {
    if (this._status === UserStatus.DEACTIVATED) {
      throw new BusinessRuleViolationException('Cannot change password of deactivated user');
    }

    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  // Getters
  get id(): UserId { return this._id; }
  get email(): Email { return this._email; }
  get username(): Username { return this._username; }
  get passwordHash(): string { return this._passwordHash; }
  get status(): UserStatus { return this._status; }
  get profile(): UserProfile { return this._profile; }
  get preferences(): UserPreferences { return this._preferences; }
  get failedLoginAttempts(): number { return this._failedLoginAttempts; }
  get lastLoginAt(): Date | undefined { return this._lastLoginAt; }
  get verifiedAt(): Date | undefined { return this._verifiedAt; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Computed properties
  get isVerified(): boolean { return this._status === UserStatus.VERIFIED; }
  get isActive(): boolean { return this._status === UserStatus.VERIFIED || this._status === UserStatus.PENDING_VERIFICATION; }
  get isSuspended(): boolean { return this._status === UserStatus.SUSPENDED; }
  get isDeactivated(): boolean { return this._status === UserStatus.DEACTIVATED; }

  get fullName(): string {
    if (!this._profile.firstName && !this._profile.lastName) {
      return this._username.toString();
    }
    return [this._profile.firstName, this._profile.lastName].filter(Boolean).join(' ');
  }

  get profileCompletionPercentage(): number {
    const fields = ['firstName', 'lastName', 'bio', 'avatarUrl', 'dateOfBirth'];
    const completedFields = fields.filter(field => this._profile[field]);
    return Math.round((completedFields.length / fields.length) * 100);
  }
}