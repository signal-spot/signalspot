import { DomainEvent } from '../../shared/events/domain-event.base';
import { UserId } from '../value-objects/user-id.value-object';

export class UserVerifiedEvent extends DomainEvent {
  constructor(public readonly userId: UserId) {
    super();
  }

  getEventName(): string {
    return 'user.verified';
  }
}