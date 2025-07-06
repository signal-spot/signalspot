export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  protected constructor() {
    this.occurredOn = new Date();
    this.eventId = crypto.randomUUID();
  }

  abstract getEventName(): string;
}