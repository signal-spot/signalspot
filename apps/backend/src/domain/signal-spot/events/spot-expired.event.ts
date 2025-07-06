import { DomainEvent } from '../../shared/events/domain-event.base';
import { SpotId } from '../value-objects/spot-id.value-object';

export class SpotExpiredEvent extends DomainEvent {
  constructor(public readonly spotId: SpotId) {
    super();
  }

  getEventName(): string {
    return 'spot.expired';
  }
}