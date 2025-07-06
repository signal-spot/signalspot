import { InvalidValueObjectException } from '../../shared/exceptions/domain.exception';

export class SpotRadius {
  private readonly value: number; // in meters

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): SpotRadius {
    if (value <= 0) {
      throw new InvalidValueObjectException('SpotRadius', 'Radius must be greater than 0');
    }

    if (value < 10) {
      throw new InvalidValueObjectException('SpotRadius', 'Minimum radius is 10 meters');
    }

    if (value > 10000) {
      throw new InvalidValueObjectException('SpotRadius', 'Maximum radius is 10 kilometers');
    }

    return new SpotRadius(value);
  }

  static small(): SpotRadius {
    return new SpotRadius(50); // 50m
  }

  static medium(): SpotRadius {
    return new SpotRadius(200); // 200m
  }

  static large(): SpotRadius {
    return new SpotRadius(1000); // 1km
  }

  getValue(): number {
    return this.value;
  }

  getValueInKilometers(): number {
    return this.value / 1000;
  }

  equals(other: SpotRadius): boolean {
    return this.value === other.value;
  }

  toString(): string {
    if (this.value >= 1000) {
      return `${this.getValueInKilometers()}km`;
    }
    return `${this.value}m`;
  }
}