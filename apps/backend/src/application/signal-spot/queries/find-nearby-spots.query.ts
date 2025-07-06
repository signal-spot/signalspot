export class FindNearbySpotsQuery {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly radiusKm: number,
    public readonly category?: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}