export class CreateSpotCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly radius: number,
    public readonly category: string,
    public readonly visibility: string,
    public readonly durationHours: number,
    public readonly createdBy: string,
  ) {}
}