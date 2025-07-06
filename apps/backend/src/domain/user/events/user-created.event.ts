import { DomainEvent } from '../../shared/events/domain-event.base';
import { UserId } from '../value-objects/user-id.value-object';
import { Email } from '../value-objects/email.value-object';

export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
  ) {
    super();
  }

  getEventName(): string {
    return 'user.created';
  }
}