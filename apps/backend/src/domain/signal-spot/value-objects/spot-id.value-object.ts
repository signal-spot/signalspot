import { Id } from '../../shared/value-objects/id.value-object';
import { v4 as uuidv4 } from 'uuid';

export class SpotId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): SpotId {
    return new SpotId(value);
  }

  static generate(): SpotId {
    return new SpotId(uuidv4());
  }
}