export class InteractWithSpotCommand {
  constructor(
    public readonly spotId: string,
    public readonly userId: string,
    public readonly interactionType: string,
    public readonly content?: string,
  ) {}
}