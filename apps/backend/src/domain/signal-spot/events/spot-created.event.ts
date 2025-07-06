import { DomainEvent } from '../../shared/events/domain-event.base';
import { SpotId } from '../value-objects/spot-id.value-object';
import { UserId } from '../../user/value-objects/user-id.value-object';
import { Coordinates } from '../../shared/value-objects/coordinates.value-object';
import { SpotCategory } from '../entities/signal-spot.entity';

export class SpotCreatedEvent extends DomainEvent {
  constructor(
    public readonly spotId: SpotId,
    public readonly createdBy: UserId,
    public readonly location: Coordinates,
    public readonly category: SpotCategory,
  ) {
    super();
  }

  getEventName(): string {
    return 'spot.created';
  }
}