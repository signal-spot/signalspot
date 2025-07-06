import { DomainEvent } from '../../shared/events/domain-event.base';
import { UserId } from '../value-objects/user-id.value-object';
import { UserProfile } from '../entities/user.entity';

export class UserProfileUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly updates: Partial<UserProfile>,
  ) {
    super();
  }

  getEventName(): string {
    return 'user.profile.updated';
  }
}