export class Coordinates {
  private readonly latitude: number;
  private readonly longitude: number;

  private constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static create(latitude: number, longitude: number): Coordinates {
    if (!this.isValidLatitude(latitude)) {
      throw new Error('Invalid latitude. Must be between -90 and 90');
    }
    
    if (!this.isValidLongitude(longitude)) {
      throw new Error('Invalid longitude. Must be between -180 and 180');
    }

    return new Coordinates(latitude, longitude);
  }

  private static isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  private static isValidLongitude(lng: number): boolean {
    return lng >= -180 && lng <= 180;
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }

  distanceTo(other: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(other.latitude - this.latitude);
    const dLng = this.toRadians(other.longitude - this.longitude);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.latitude)) * Math.cos(this.toRadians(other.latitude)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  equals(other: Coordinates): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }

  toString(): string {
    return `${this.latitude},${this.longitude}`;
  }
}