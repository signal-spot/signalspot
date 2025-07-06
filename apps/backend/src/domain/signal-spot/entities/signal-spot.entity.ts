import { AggregateRoot } from '../../shared/events/aggregate-root.base';
import { BusinessRuleViolationException } from '../../shared/exceptions/domain.exception';
import { Coordinates } from '../../shared/value-objects/coordinates.value-object';
import { SpotId } from '../value-objects/spot-id.value-object';
import { SpotContent } from '../value-objects/spot-content.value-object';
import { SpotRadius } from '../value-objects/spot-radius.value-object';
import { UserId } from '../../user/value-objects/user-id.value-object';
import { SpotCreatedEvent } from '../events/spot-created.event';
import { SpotExpiredEvent } from '../events/spot-expired.event';
import { SpotInteractionEvent } from '../events/spot-interaction.event';

export enum SpotStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PAUSED = 'paused',
  REMOVED = 'removed',
}

export enum SpotVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

export enum SpotCategory {
  GENERAL = 'general',
  FOOD = 'food',
  EVENT = 'event',
  HELP = 'help',
  SOCIAL = 'social',
  BUSINESS = 'business',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
}

export enum SpotInteractionType {
  VIEW = 'view',
  LIKE = 'like',
  DISLIKE = 'dislike',
  REPLY = 'reply',
  SHARE = 'share',
  REPORT = 'report',
}

export interface SpotInteraction {
  userId: UserId;
  type: SpotInteractionType;
  timestamp: Date;
  content?: string; // for replies
}

export interface SpotStatistics {
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  shareCount: number;
  reportCount: number;
}

export class SignalSpot extends AggregateRoot {
  private _interactions: SpotInteraction[] = [];

  private constructor(
    private readonly _id: SpotId,
    private _content: SpotContent,
    private readonly _location: Coordinates,
    private readonly _radius: SpotRadius,
    private readonly _category: SpotCategory,
    private _visibility: SpotVisibility,
    private readonly _createdBy: UserId,
    private _status: SpotStatus,
    private readonly _createdAt: Date,
    private _expiresAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(props: {
    content: { title: string; description: string };
    location: { latitude: number; longitude: number };
    radius: number;
    category: SpotCategory;
    visibility: SpotVisibility;
    createdBy: string;
    durationHours: number;
  }): SignalSpot {
    const id = SpotId.generate();
    const content = SpotContent.create(props.content.title, props.content.description);
    const location = Coordinates.create(props.location.latitude, props.location.longitude);
    const radius = SpotRadius.create(props.radius);
    const createdBy = UserId.create(props.createdBy);

    // Business rule: Duration must be between 1 hour and 7 days
    if (props.durationHours < 1 || props.durationHours > 168) {
      throw new BusinessRuleViolationException('Spot duration must be between 1 hour and 7 days');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + props.durationHours * 60 * 60 * 1000);

    const spot = new SignalSpot(
      id,
      content,
      location,
      radius,
      props.category,
      props.visibility,
      createdBy,
      SpotStatus.ACTIVE,
      now,
      expiresAt,
      now,
    );

    spot.addDomainEvent(new SpotCreatedEvent(id, createdBy, location, props.category));
    return spot;
  }

  static reconstitute(props: {
    id: string;
    content: { title: string; description: string };
    location: { latitude: number; longitude: number };
    radius: number;
    category: SpotCategory;
    visibility: SpotVisibility;
    createdBy: string;
    status: SpotStatus;
    createdAt: Date;
    expiresAt: Date;
    updatedAt: Date;
    interactions: SpotInteraction[];
  }): SignalSpot {
    const spot = new SignalSpot(
      SpotId.create(props.id),
      SpotContent.create(props.content.title, props.content.description),
      Coordinates.create(props.location.latitude, props.location.longitude),
      SpotRadius.create(props.radius),
      props.category,
      props.visibility,
      UserId.create(props.createdBy),
      props.status,
      props.createdAt,
      props.expiresAt,
      props.updatedAt,
    );

    spot._interactions = props.interactions;
    return spot;
  }

  addInteraction(userId: string, type: SpotInteractionType, content?: string): void {
    if (this._status !== SpotStatus.ACTIVE) {
      throw new BusinessRuleViolationException('Cannot interact with inactive spot');
    }

    if (this.isExpired()) {
      this.expire();
      throw new BusinessRuleViolationException('Cannot interact with expired spot');
    }

    const userIdObj = UserId.create(userId);

    // Business rule: Cannot like/dislike your own spot
    if ((type === SpotInteractionType.LIKE || type === SpotInteractionType.DISLIKE) && 
        this._createdBy.equals(userIdObj)) {
      throw new BusinessRuleViolationException('Cannot like or dislike your own spot');
    }

    // Business rule: Only one like/dislike per user
    if (type === SpotInteractionType.LIKE || type === SpotInteractionType.DISLIKE) {
      const existingReaction = this._interactions.find(
        i => i.userId.equals(userIdObj) && 
        (i.type === SpotInteractionType.LIKE || i.type === SpotInteractionType.DISLIKE)
      );
      
      if (existingReaction) {
        // Remove previous reaction
        this._interactions = this._interactions.filter(i => i !== existingReaction);
      }
    }

    const interaction: SpotInteraction = {
      userId: userIdObj,
      type,
      timestamp: new Date(),
      content,
    };

    this._interactions.push(interaction);
    this._updatedAt = new Date();

    this.addDomainEvent(new SpotInteractionEvent(this._id, userIdObj, type));

    // Auto-remove if too many reports
    if (type === SpotInteractionType.REPORT && this.getStatistics().reportCount >= 5) {
      this.remove();
    }
  }

  updateContent(newContent: { title: string; description: string }, updatedBy: string): void {
    if (!this._createdBy.equals(UserId.create(updatedBy))) {
      throw new BusinessRuleViolationException('Only the creator can update spot content');
    }

    if (this._status !== SpotStatus.ACTIVE) {
      throw new BusinessRuleViolationException('Cannot update inactive spot');
    }

    this._content = SpotContent.create(newContent.title, newContent.description);
    this._updatedAt = new Date();
  }

  pause(pausedBy: string): void {
    if (!this._createdBy.equals(UserId.create(pausedBy))) {
      throw new BusinessRuleViolationException('Only the creator can pause the spot');
    }

    if (this._status !== SpotStatus.ACTIVE) {
      throw new BusinessRuleViolationException('Can only pause active spots');
    }

    this._status = SpotStatus.PAUSED;
    this._updatedAt = new Date();
  }

  resume(resumedBy: string): void {
    if (!this._createdBy.equals(UserId.create(resumedBy))) {
      throw new BusinessRuleViolationException('Only the creator can resume the spot');
    }

    if (this._status !== SpotStatus.PAUSED) {
      throw new BusinessRuleViolationException('Can only resume paused spots');
    }

    if (this.isExpired()) {
      throw new BusinessRuleViolationException('Cannot resume expired spot');
    }

    this._status = SpotStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  extend(additionalHours: number, extendedBy: string): void {
    if (!this._createdBy.equals(UserId.create(extendedBy))) {
      throw new BusinessRuleViolationException('Only the creator can extend the spot');
    }

    if (this._status === SpotStatus.REMOVED || this._status === SpotStatus.EXPIRED) {
      throw new BusinessRuleViolationException('Cannot extend removed or expired spot');
    }

    if (additionalHours <= 0 || additionalHours > 24) {
      throw new BusinessRuleViolationException('Can only extend by 1-24 hours');
    }

    // Business rule: Maximum total duration is 7 days
    const maxExpiresAt = new Date(this._createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newExpiresAt = new Date(this._expiresAt.getTime() + additionalHours * 60 * 60 * 1000);

    if (newExpiresAt > maxExpiresAt) {
      throw new BusinessRuleViolationException('Cannot extend beyond 7 days total duration');
    }

    this._expiresAt = newExpiresAt;
    this._updatedAt = new Date();
  }

  remove(): void {
    this._status = SpotStatus.REMOVED;
    this._updatedAt = new Date();
  }

  expire(): void {
    if (this._status === SpotStatus.ACTIVE || this._status === SpotStatus.PAUSED) {
      this._status = SpotStatus.EXPIRED;
      this._updatedAt = new Date();
      this.addDomainEvent(new SpotExpiredEvent(this._id));
    }
  }

  changeVisibility(visibility: SpotVisibility, changedBy: string): void {
    if (!this._createdBy.equals(UserId.create(changedBy))) {
      throw new BusinessRuleViolationException('Only the creator can change visibility');
    }

    this._visibility = visibility;
    this._updatedAt = new Date();
  }

  isWithinRadius(coordinates: Coordinates): boolean {
    const distance = this._location.distanceTo(coordinates);
    return distance <= this._radius.getValueInKilometers();
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  getStatistics(): SpotStatistics {
    return {
      viewCount: this._interactions.filter(i => i.type === SpotInteractionType.VIEW).length,
      likeCount: this._interactions.filter(i => i.type === SpotInteractionType.LIKE).length,
      dislikeCount: this._interactions.filter(i => i.type === SpotInteractionType.DISLIKE).length,
      replyCount: this._interactions.filter(i => i.type === SpotInteractionType.REPLY).length,
      shareCount: this._interactions.filter(i => i.type === SpotInteractionType.SHARE).length,
      reportCount: this._interactions.filter(i => i.type === SpotInteractionType.REPORT).length,
    };
  }

  getReplies(): SpotInteraction[] {
    return this._interactions
      .filter(i => i.type === SpotInteractionType.REPLY)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  getRemainingTimeInMinutes(): number {
    if (this.isExpired()) return 0;
    return Math.max(0, Math.floor((this._expiresAt.getTime() - Date.now()) / (1000 * 60)));
  }

  // Getters
  get id(): SpotId { return this._id; }
  get content(): SpotContent { return this._content; }
  get location(): Coordinates { return this._location; }
  get radius(): SpotRadius { return this._radius; }
  get category(): SpotCategory { return this._category; }
  get visibility(): SpotVisibility { return this._visibility; }
  get createdBy(): UserId { return this._createdBy; }
  get status(): SpotStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get expiresAt(): Date { return this._expiresAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get interactions(): SpotInteraction[] { return [...this._interactions]; }

  // Computed properties
  get isActive(): boolean { return this._status === SpotStatus.ACTIVE && !this.isExpired(); }
  get isPaused(): boolean { return this._status === SpotStatus.PAUSED; }
  get isRemoved(): boolean { return this._status === SpotStatus.REMOVED; }
}