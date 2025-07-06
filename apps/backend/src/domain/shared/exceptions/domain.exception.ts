export abstract class DomainException extends Error {
  abstract readonly code: string;

  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BusinessRuleViolationException extends DomainException {
  readonly code = 'BUSINESS_RULE_VIOLATION';

  constructor(rule: string, details?: any) {
    super(`Business rule violation: ${rule}`, details);
  }
}

export class AggregateNotFoundException extends DomainException {
  readonly code = 'AGGREGATE_NOT_FOUND';

  constructor(aggregateType: string, id: string) {
    super(`${aggregateType} with ID ${id} not found`);
  }
}

export class InvalidValueObjectException extends DomainException {
  readonly code = 'INVALID_VALUE_OBJECT';

  constructor(valueObject: string, reason: string) {
    super(`Invalid ${valueObject}: ${reason}`);
  }
}