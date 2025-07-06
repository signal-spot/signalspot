import { Id } from '../../shared/value-objects/id.value-object';

export class UserId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

  static generate(): UserId {
    return new UserId(super.generate());
  }
}