import { v4 as generateUuid } from 'uuid';

export abstract class Id {
  protected readonly value: string;

  protected constructor(value: string) {
    if (!value) {
      throw new Error('ID cannot be empty');
    }
    this.value = value;
  }

  static generate(): Id {
    throw new Error('generate() must be implemented by subclasses');
  }

  equals(other: Id): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}