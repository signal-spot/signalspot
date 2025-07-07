import { Id } from '../../shared/value-objects/id.value-object';
import { v4 as uuidv4 } from 'uuid';

export class UserId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

  static generate(): UserId {
    return new UserId(uuidv4());
  }
}