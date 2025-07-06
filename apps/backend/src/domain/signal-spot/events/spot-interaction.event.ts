import { DomainEvent } from '../../shared/events/domain-event.base';
import { SpotId } from '../value-objects/spot-id.value-object';
import { UserId } from '../../user/value-objects/user-id.value-object';
import { SpotInteractionType } from '../entities/signal-spot.entity';

export class SpotInteractionEvent extends DomainEvent {
  constructor(
    public readonly spotId: SpotId,
    public readonly userId: UserId,
    public readonly interactionType: SpotInteractionType,
  ) {
    super();
  }

  getEventName(): string {
    return 'spot.interaction';
  }
}