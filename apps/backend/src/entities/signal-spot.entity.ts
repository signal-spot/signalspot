import { Entity, PrimaryKey, Property, Index, ManyToOne, Ref, Collection, OneToMany, Reference } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';
import { Location } from './location.entity';
import { AggregateRoot, DomainEvent } from './user.entity';
import { Coordinates } from './location.entity';

// Value Objects for SignalSpot
export class SpotId {
  private constructor(private readonly value: string) {}

  static generate(): SpotId {
    return new SpotId(v4());
  }

  static fromString(value: string): SpotId {
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid SpotId');
    }
    return new SpotId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: SpotId): boolean {
    return this.value === other.value;
  }
}

export class SpotContent {
  private constructor(
    private readonly _message: string,
    private readonly _title?: string
  ) {}

  static create(message: string, title?: string): SpotContent {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 500) {
      throw new Error('Message cannot exceed 500 characters');
    }

    if (title && title.length > 100) {
      throw new Error('Title cannot exceed 100 characters');
    }

    const trimmedMessage = message.trim();
    const trimmedTitle = title?.trim();

    return new SpotContent(trimmedMessage, trimmedTitle);
  }

  get message(): string {
    return this._message;
  }

  get title(): string | undefined {
    return this._title;
  }

  hasTitle(): boolean {
    return this._title !== undefined && this._title.length > 0;
  }

  getDisplayText(): string {
    return this.hasTitle() ? `${this._title}: ${this._message}` : this._message;
  }

  equals(other: SpotContent): boolean {
    return this._message === other._message && this._title === other._title;
  }
}

export class SpotRadius {
  private constructor(private readonly value: number) {}

  static create(radiusInMeters: number): SpotRadius {
    if (radiusInMeters <= 0) {
      throw new Error('Radius must be positive');
    }

    if (radiusInMeters > 1000) {
      throw new Error('Radius cannot exceed 1000 meters');
    }

    return new SpotRadius(radiusInMeters);
  }

  static default(): SpotRadius {
    return new SpotRadius(100); // Default 100 meters
  }

  get meters(): number {
    return this.value;
  }

  get kilometers(): number {
    return this.value / 1000;
  }

  equals(other: SpotRadius): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return `${this.value}m`;
  }
}

export class SpotDuration {
  private constructor(private readonly value: number) {}

  static create(durationInHours: number): SpotDuration {
    if (durationInHours <= 0) {
      throw new Error('Duration must be positive');
    }

    if (durationInHours > 168) { // 1 week max
      throw new Error('Duration cannot exceed 168 hours (1 week)');
    }

    return new SpotDuration(durationInHours);
  }

  static default(): SpotDuration {
    return new SpotDuration(24); // Default 24 hours
  }

  static fromMinutes(minutes: number): SpotDuration {
    return SpotDuration.create(minutes / 60);
  }

  static fromDays(days: number): SpotDuration {
    return SpotDuration.create(days * 24);
  }

  get hours(): number {
    return this.value;
  }

  get minutes(): number {
    return this.value * 60;
  }

  get milliseconds(): number {
    return this.value * 60 * 60 * 1000;
  }

  equals(other: SpotDuration): boolean {
    return this.value === other.value;
  }

  toString(): string {
    if (this.value < 1) {
      return `${Math.round(this.value * 60)}min`;
    } else if (this.value < 24) {
      return `${this.value}h`;
    } else {
      return `${Math.round(this.value / 24)}d`;
    }
  }
}

export class SpotTags {
  private constructor(private readonly values: string[]) {}

  static create(tags: string[]): SpotTags {
    if (tags.length > 10) {
      throw new Error('Cannot have more than 10 tags');
    }

    const validTags = tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length <= 30)
      .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates

    return new SpotTags(validTags);
  }

  static empty(): SpotTags {
    return new SpotTags([]);
  }

  get tags(): string[] {
    return [...this.values];
  }

  hasTag(tag: string): boolean {
    return this.values.includes(tag.toLowerCase());
  }

  addTag(tag: string): SpotTags {
    if (this.values.length >= 10) {
      throw new Error('Cannot add more than 10 tags');
    }

    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag.length === 0 || normalizedTag.length > 30) {
      throw new Error('Tag must be between 1 and 30 characters');
    }

    if (this.hasTag(normalizedTag)) {
      return this; // Tag already exists
    }

    return new SpotTags([...this.values, normalizedTag]);
  }

  removeTag(tag: string): SpotTags {
    const normalizedTag = tag.trim().toLowerCase();
    return new SpotTags(this.values.filter(t => t !== normalizedTag));
  }

  isEmpty(): boolean {
    return this.values.length === 0;
  }

  toString(): string {
    return this.values.join(', ');
  }

  equals(other: SpotTags): boolean {
    return this.values.length === other.values.length &&
           this.values.every(tag => other.values.includes(tag));
  }
}

// Enums for SignalSpot
export enum SpotStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PAUSED = 'paused',
  REMOVED = 'removed'
}

export enum SpotVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private'
}

export enum SpotType {
  ANNOUNCEMENT = 'announcement',
  QUESTION = 'question',
  MEETUP = 'meetup',
  ALERT = 'alert',
  SOCIAL = 'social',
  BUSINESS = 'business'
}

export enum SpotInteractionType {
  VIEW = 'view',
  LIKE = 'like',
  DISLIKE = 'dislike',
  REPLY = 'reply',
  SHARE = 'share',
  REPORT = 'report'
}

// Domain Events for SignalSpot
export class SpotCreatedEvent extends DomainEvent {
  constructor(
    readonly spotId: SpotId,
    readonly creatorId: string,
    readonly location: Coordinates,
    readonly content: SpotContent,
    readonly visibility: SpotVisibility
  ) {
    super();
  }
}

export class SpotExpiredEvent extends DomainEvent {
  constructor(
    readonly spotId: SpotId,
    readonly creatorId: string
  ) {
    super();
  }
}

export class SpotInteractionEvent extends DomainEvent {
  constructor(
    readonly spotId: SpotId,
    readonly userId: string,
    readonly interactionType: SpotInteractionType,
    readonly metadata?: Record<string, any>
  ) {
    super();
  }
}

export class SpotRemovedEvent extends DomainEvent {
  constructor(
    readonly spotId: SpotId,
    readonly creatorId: string,
    readonly reason: string
  ) {
    super();
  }
}

export class SpotStatusChangedEvent extends DomainEvent {
  constructor(
    readonly spotId: SpotId,
    readonly previousStatus: SpotStatus,
    readonly newStatus: SpotStatus
  ) {
    super();
  }
}

export class SpotReachedViewThresholdEvent extends DomainEvent {
  constructor(
    readonly spotId: SpotId,
    readonly viewCount: number,
    readonly threshold: number
  ) {
    super();
  }
}

// SignalSpot Entity
@Entity()
export class SignalSpot extends AggregateRoot {
  @PrimaryKey({ type: 'uuid' })
  @Index()
  id: string;

  @ManyToOne(() => User, { ref: true })
  @Index()
  creator: Ref<User>;

  @Property()
  message: string;

  @Property({ nullable: true })
  title?: string;

  @Property({ type: 'double' })
  @Index()
  latitude: number;

  @Property({ type: 'double' })
  @Index()
  longitude: number;

  @Property({ type: 'integer', default: 100 })
  radiusInMeters = 100;

  @Property({ type: 'integer', default: 24 })
  durationInHours = 24;

  @Property({ type: 'string', default: SpotStatus.ACTIVE })
  @Index()
  status: SpotStatus = SpotStatus.ACTIVE;

  @Property({ type: 'string', default: SpotVisibility.PUBLIC })
  @Index()
  visibility: SpotVisibility = SpotVisibility.PUBLIC;

  @Property({ type: 'string', default: SpotType.ANNOUNCEMENT })
  @Index()
  type: SpotType = SpotType.ANNOUNCEMENT;

  @Property({ type: 'json', nullable: true })
  tags?: string[];

  @Property({ type: 'integer', default: 0 })
  viewCount = 0;

  @Property({ type: 'integer', default: 0 })
  likeCount = 0;

  @Property({ type: 'integer', default: 0 })
  dislikeCount = 0;

  @Property({ type: 'integer', default: 0 })
  replyCount = 0;

  @Property({ type: 'integer', default: 0 })
  shareCount = 0;

  @Property({ type: 'integer', default: 0 })
  reportCount = 0;

  @Property({ type: 'boolean', default: true })
  isActive = true;

  @Property({ type: 'boolean', default: false })
  isPinned = false;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Property({ onCreate: () => new Date() })
  @Index()
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ type: 'date' })
  @Index()
  expiresAt: Date;

  // Rich Domain Model Constructor
  private constructor() {
    super();
    this.id = v4();
  }

  // Factory method for creating new SignalSpots
  static create(data: {
    creator: User;
    message: string;
    title?: string;
    latitude: number;
    longitude: number;
    radiusInMeters?: number;
    durationInHours?: number;
    visibility?: SpotVisibility;
    type?: SpotType;
    tags?: string[];
    metadata?: Record<string, any>;
  }): SignalSpot {
    const spot = new SignalSpot();
    
    // Validate using value objects
    const content = SpotContent.create(data.message, data.title);
    const coordinates = Coordinates.create(data.latitude, data.longitude);
    const radius = data.radiusInMeters ? SpotRadius.create(data.radiusInMeters) : SpotRadius.default();
    const duration = data.durationInHours ? SpotDuration.create(data.durationInHours) : SpotDuration.default();
    const spotTags = data.tags ? SpotTags.create(data.tags) : SpotTags.empty();
    
    // Business rule: Only verified users can create spots
    if (!data.creator.canCreateSignalSpot()) {
      throw new Error('User cannot create SignalSpot');
    }
    
    spot.creator = Reference.create(data.creator);
    spot.message = content.message;
    spot.title = content.title;
    spot.latitude = coordinates.latitude;
    spot.longitude = coordinates.longitude;
    spot.radiusInMeters = radius.meters;
    spot.durationInHours = duration.hours;
    spot.visibility = data.visibility ?? SpotVisibility.PUBLIC;
    spot.type = data.type ?? SpotType.ANNOUNCEMENT;
    spot.tags = spotTags.isEmpty() ? undefined : spotTags.tags;
    spot.metadata = data.metadata;
    spot.createdAt = new Date();
    spot.expiresAt = new Date(Date.now() + duration.milliseconds);
    
    // Emit domain event
    spot.addDomainEvent(new SpotCreatedEvent(
      SpotId.fromString(spot.id),
      data.creator.id,
      coordinates,
      content,
      spot.visibility
    ));
    
    return spot;
  }

  // Business Logic Methods
  public recordView(viewingUser?: User): void {
    // Business rule: Don't count creator's own views
    if (viewingUser && viewingUser.id === this.creator.id) {
      return;
    }

    this.viewCount++;
    this.updatedAt = new Date();

    // Emit interaction event
    this.addDomainEvent(new SpotInteractionEvent(
      this.getSpotId(),
      viewingUser?.id || 'anonymous',
      SpotInteractionType.VIEW
    ));

    // Check for view threshold milestones
    const thresholds = [10, 50, 100, 500, 1000];
    if (thresholds.includes(this.viewCount)) {
      this.addDomainEvent(new SpotReachedViewThresholdEvent(
        this.getSpotId(),
        this.viewCount,
        this.viewCount
      ));
    }
  }

  public addLike(user: User): void {
    if (!this.canInteract(user)) {
      throw new Error('User cannot interact with this spot');
    }

    this.likeCount++;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotInteractionEvent(
      this.getSpotId(),
      user.id,
      SpotInteractionType.LIKE
    ));
  }

  public addDislike(user: User): void {
    if (!this.canInteract(user)) {
      throw new Error('User cannot interact with this spot');
    }

    this.dislikeCount++;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotInteractionEvent(
      this.getSpotId(),
      user.id,
      SpotInteractionType.DISLIKE
    ));
  }

  public addReply(user: User): void {
    if (!this.canInteract(user)) {
      throw new Error('User cannot interact with this spot');
    }

    this.replyCount++;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotInteractionEvent(
      this.getSpotId(),
      user.id,
      SpotInteractionType.REPLY
    ));
  }

  public addShare(user: User): void {
    if (!this.canInteract(user)) {
      throw new Error('User cannot interact with this spot');
    }

    this.shareCount++;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotInteractionEvent(
      this.getSpotId(),
      user.id,
      SpotInteractionType.SHARE
    ));
  }

  public reportSpot(user: User, reason: string): void {
    if (!this.canInteract(user)) {
      throw new Error('User cannot interact with this spot');
    }

    this.reportCount++;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotInteractionEvent(
      this.getSpotId(),
      user.id,
      SpotInteractionType.REPORT,
      { reason }
    ));

    // Business rule: Auto-remove spots with too many reports
    if (this.reportCount >= 10) {
      this.remove('Excessive reports');
    }
  }

  public expire(): void {
    if (this.status === SpotStatus.EXPIRED) {
      return;
    }

    const previousStatus = this.status;
    this.status = SpotStatus.EXPIRED;
    this.isActive = false;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotExpiredEvent(
      this.getSpotId(),
      this.creator.id
    ));

    this.addDomainEvent(new SpotStatusChangedEvent(
      this.getSpotId(),
      previousStatus,
      this.status
    ));
  }

  public pause(): void {
    if (this.status !== SpotStatus.ACTIVE) {
      throw new Error('Can only pause active spots');
    }

    const previousStatus = this.status;
    this.status = SpotStatus.PAUSED;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotStatusChangedEvent(
      this.getSpotId(),
      previousStatus,
      this.status
    ));
  }

  public resume(): void {
    if (this.status !== SpotStatus.PAUSED) {
      throw new Error('Can only resume paused spots');
    }

    if (this.isExpired()) {
      throw new Error('Cannot resume expired spot');
    }

    const previousStatus = this.status;
    this.status = SpotStatus.ACTIVE;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotStatusChangedEvent(
      this.getSpotId(),
      previousStatus,
      this.status
    ));
  }

  public remove(reason: string): void {
    if (this.status === SpotStatus.REMOVED) {
      return;
    }

    const previousStatus = this.status;
    this.status = SpotStatus.REMOVED;
    this.isActive = false;
    this.updatedAt = new Date();

    this.addDomainEvent(new SpotRemovedEvent(
      this.getSpotId(),
      this.creator.id,
      reason
    ));

    this.addDomainEvent(new SpotStatusChangedEvent(
      this.getSpotId(),
      previousStatus,
      this.status
    ));
  }

  public pin(): void {
    this.isPinned = true;
    this.updatedAt = new Date();
  }

  public unpin(): void {
    this.isPinned = false;
    this.updatedAt = new Date();
  }

  public updateContent(newMessage: string, newTitle?: string): void {
    const content = SpotContent.create(newMessage, newTitle);
    
    this.message = content.message;
    this.title = content.title;
    this.updatedAt = new Date();
  }

  public updateTags(newTags: string[]): void {
    const spotTags = SpotTags.create(newTags);
    this.tags = spotTags.isEmpty() ? undefined : spotTags.tags;
    this.updatedAt = new Date();
  }

  public extendDuration(additionalHours: number): void {
    if (this.status !== SpotStatus.ACTIVE) {
      throw new Error('Can only extend active spots');
    }

    const newDuration = SpotDuration.create(this.durationInHours + additionalHours);
    this.durationInHours = newDuration.hours;
    this.expiresAt = new Date(this.createdAt.getTime() + newDuration.milliseconds);
    this.updatedAt = new Date();
  }

  // Business Rule Methods
  public canInteract(user: User): boolean {
    if (!this.isActive || this.status !== SpotStatus.ACTIVE) {
      return false;
    }

    if (this.isExpired()) {
      return false;
    }

    if (this.visibility === SpotVisibility.PRIVATE && this.creator.id !== user.id) {
      return false;
    }

    if (this.visibility === SpotVisibility.FRIENDS && this.creator.id !== user.id) {
      // TODO: Implement friend relationship check
      return false;
    }

    return true;
  }

  public canBeViewedBy(user: User): boolean {
    if (this.visibility === SpotVisibility.PUBLIC) {
      return true;
    }

    if (this.visibility === SpotVisibility.PRIVATE) {
      return this.creator.id === user.id;
    }

    if (this.visibility === SpotVisibility.FRIENDS) {
      if (this.creator.id === user.id) {
        return true;
      }
      // TODO: Implement friend relationship check
      return false;
    }

    return false;
  }

  public canBeEditedBy(user: User): boolean {
    return this.creator.id === user.id && this.status === SpotStatus.ACTIVE;
  }

  public canBeRemovedBy(user: User): boolean {
    return this.creator.id === user.id || user.isVerified; // Verified users can remove reported spots
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isWithinRadius(userLocation: Coordinates): boolean {
    const spotLocation = this.getCoordinates();
    return spotLocation.isWithinRadius(userLocation, this.radiusInMeters / 1000);
  }

  public isNearExpiration(minutesThreshold = 60): boolean {
    const now = new Date();
    const timeUntilExpiration = this.expiresAt.getTime() - now.getTime();
    return timeUntilExpiration <= (minutesThreshold * 60 * 1000);
  }

  public hasTag(tag: string): boolean {
    return this.tags?.includes(tag.toLowerCase()) ?? false;
  }

  public getTotalEngagement(): number {
    return this.likeCount + this.dislikeCount + this.replyCount + this.shareCount;
  }

  public getEngagementScore(): number {
    // Weighted engagement score
    return (this.likeCount * 2) + (this.replyCount * 3) + (this.shareCount * 4) - (this.dislikeCount * 1);
  }

  public getPopularityScore(): number {
    // Popularity based on views and engagement
    return (this.viewCount * 0.1) + (this.getTotalEngagement() * 2);
  }

  public getRemainingTime(): number {
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }

  public getRemainingTimeFormatted(): string {
    const remaining = this.getRemainingTime();
    if (remaining <= 0) return 'Expired';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Value Object Getters
  public getSpotId(): SpotId {
    return SpotId.fromString(this.id);
  }

  public getContent(): SpotContent {
    return SpotContent.create(this.message, this.title);
  }

  public getCoordinates(): Coordinates {
    return Coordinates.create(this.latitude, this.longitude);
  }

  public getRadius(): SpotRadius {
    return SpotRadius.create(this.radiusInMeters);
  }

  public getDuration(): SpotDuration {
    return SpotDuration.create(this.durationInHours);
  }

  public getTags(): SpotTags {
    return this.tags ? SpotTags.create(this.tags) : SpotTags.empty();
  }

  // Distance calculation to a location
  public distanceTo(location: Coordinates): number {
    const spotLocation = this.getCoordinates();
    return spotLocation.distanceTo(location);
  }

  // Convert to GeoJSON representation
  public toGeoJSON(): any {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [this.longitude, this.latitude]
      },
      properties: {
        id: this.id,
        creatorId: this.creator.id,
        message: this.message,
        title: this.title,
        radius: this.radiusInMeters,
        duration: this.durationInHours,
        status: this.status,
        visibility: this.visibility,
        type: this.type,
        tags: this.tags,
        viewCount: this.viewCount,
        likeCount: this.likeCount,
        dislikeCount: this.dislikeCount,
        replyCount: this.replyCount,
        shareCount: this.shareCount,
        isPinned: this.isPinned,
        createdAt: this.createdAt,
        expiresAt: this.expiresAt,
        updatedAt: this.updatedAt
      }
    };
  }

  // Get summary for API responses
  public getSummary(): any {
    return {
      id: this.id,
      creatorId: this.creator.id,
      message: this.message,
      title: this.title,
      location: {
        latitude: this.latitude,
        longitude: this.longitude,
        radius: this.radiusInMeters
      },
      status: this.status,
      visibility: this.visibility,
      type: this.type,
      tags: this.tags,
      engagement: {
        viewCount: this.viewCount,
        likeCount: this.likeCount,
        dislikeCount: this.dislikeCount,
        replyCount: this.replyCount,
        shareCount: this.shareCount,
        engagementScore: this.getEngagementScore(),
        popularityScore: this.getPopularityScore()
      },
      timing: {
        createdAt: this.createdAt,
        expiresAt: this.expiresAt,
        remainingTime: this.getRemainingTimeFormatted(),
        isExpired: this.isExpired()
      },
      isPinned: this.isPinned
    };
  }
}