import { Entity, PrimaryKey, Property, Index, ManyToOne, Ref, Reference } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';

// Value Objects for Location
export class LocationId {
  private constructor(private readonly value: string) {}

  static generate(): LocationId {
    return new LocationId(v4());
  }

  static fromString(value: string): LocationId {
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid LocationId');
    }
    return new LocationId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: LocationId): boolean {
    return this.value === other.value;
  }
}

export class Coordinates {
  private constructor(
    private readonly _latitude: number,
    private readonly _longitude: number
  ) {}

  static create(latitude: number, longitude: number): Coordinates {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }
    return new Coordinates(latitude, longitude);
  }

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }

  // Calculate distance to another coordinate using Haversine formula
  distanceTo(other: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(other.latitude - this.latitude);
    const dLon = this.toRadians(other.longitude - this.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(this.latitude)) * Math.cos(this.toRadians(other.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check if this location is within a certain radius of another location
  isWithinRadius(other: Coordinates, radiusKm: number): boolean {
    return this.distanceTo(other) <= radiusKm;
  }

  // Convert to GeoJSON Point format
  toGeoJSON(): { type: string; coordinates: number[] } {
    return {
      type: 'Point',
      coordinates: [this.longitude, this.latitude]
    };
  }

  // Convert to PostGIS POINT format
  toPostGISPoint(): string {
    return `POINT(${this.longitude} ${this.latitude})`;
  }

  toString(): string {
    return `${this.latitude},${this.longitude}`;
  }

  equals(other: Coordinates): boolean {
    return Math.abs(this.latitude - other.latitude) < 0.000001 &&
           Math.abs(this.longitude - other.longitude) < 0.000001;
  }
}

export enum LocationAccuracy {
  HIGH = 'high',      // GPS accuracy < 10m
  MEDIUM = 'medium',  // GPS accuracy 10-50m
  LOW = 'low'         // GPS accuracy > 50m
}

export enum LocationSource {
  GPS = 'gps',
  NETWORK = 'network',
  PASSIVE = 'passive',
  MANUAL = 'manual'
}

export enum LocationPrivacy {
  PUBLIC = 'public',      // Location visible to all users
  FRIENDS = 'friends',    // Location visible to friends only
  PRIVATE = 'private'     // Location not shared
}

// Domain Events for Location
export class LocationUpdatedEvent {
  readonly occurredOn: Date = new Date();
  readonly eventId: string = v4();

  constructor(
    readonly userId: string,
    readonly newLocation: Coordinates,
    readonly previousLocation?: Coordinates
  ) {}
}

export class LocationSharingChangedEvent {
  readonly occurredOn: Date = new Date();
  readonly eventId: string = v4();

  constructor(
    readonly userId: string,
    readonly newPrivacyLevel: LocationPrivacy,
    readonly previousPrivacyLevel: LocationPrivacy
  ) {}
}

// Location Entity
@Entity()
export class Location {
  @PrimaryKey({ type: 'uuid' })
  @Index()
  id: string;

  @ManyToOne(() => User, { ref: true })
  @Index()
  user: Ref<User>;

  @Property({ type: 'double' })
  @Index()
  latitude: number;

  @Property({ type: 'double' })
  @Index()
  longitude: number;

  @Property({ type: 'double', nullable: true })
  altitude?: number;

  @Property({ type: 'double', nullable: true })
  accuracy?: number; // Accuracy in meters

  @Property({ type: 'double', nullable: true })
  heading?: number; // Direction in degrees

  @Property({ type: 'double', nullable: true })
  speed?: number; // Speed in m/s

  @Property({ type: 'string', default: LocationAccuracy.MEDIUM })
  accuracyLevel: LocationAccuracy = LocationAccuracy.MEDIUM;

  @Property({ type: 'string', default: LocationSource.GPS })
  source: LocationSource = LocationSource.GPS;

  @Property({ type: 'string', default: LocationPrivacy.PRIVATE })
  privacy: LocationPrivacy = LocationPrivacy.PRIVATE;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true })
  city?: string;

  @Property({ nullable: true })
  country?: string;

  @Property({ nullable: true })
  postalCode?: string;

  @Property({ type: 'boolean', default: true })
  isActive = true;

  @Property({ type: 'boolean', default: false })
  isCurrentLocation = false;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Property({ onCreate: () => new Date() })
  @Index()
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Rich Domain Model Constructor
  private constructor() {
    this.id = v4();
  }

  // Factory method for creating new locations
  static create(data: {
    user: User;
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    accuracyLevel?: LocationAccuracy;
    source?: LocationSource;
    privacy?: LocationPrivacy;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    isCurrentLocation?: boolean;
    metadata?: Record<string, any>;
  }): Location {
    const location = new Location();
    
    // Validate coordinates using value object
    const coordinates = Coordinates.create(data.latitude, data.longitude);
    
    location.user = Reference.create(data.user);
    location.latitude = coordinates.latitude;
    location.longitude = coordinates.longitude;
    location.altitude = data.altitude;
    location.accuracy = data.accuracy;
    location.heading = data.heading;
    location.speed = data.speed;
    location.accuracyLevel = data.accuracyLevel ?? LocationAccuracy.MEDIUM;
    location.source = data.source ?? LocationSource.GPS;
    location.privacy = data.privacy ?? LocationPrivacy.PRIVATE;
    location.address = data.address;
    location.city = data.city;
    location.country = data.country;
    location.postalCode = data.postalCode;
    location.isCurrentLocation = data.isCurrentLocation ?? false;
    location.metadata = data.metadata;
    location.createdAt = new Date();
    
    return location;
  }

  // Business Logic Methods
  public updateCoordinates(latitude: number, longitude: number): void {
    const oldCoordinates = this.getCoordinates();
    const newCoordinates = Coordinates.create(latitude, longitude);
    
    this.latitude = newCoordinates.latitude;
    this.longitude = newCoordinates.longitude;
    this.updatedAt = new Date();
    
    // Emit domain event for location update
    // Note: In a real DDD implementation, you'd want to emit this through an event dispatcher
  }

  public updatePrivacy(newPrivacy: LocationPrivacy): void {
    if (this.privacy === newPrivacy) {
      return;
    }
    
    const oldPrivacy = this.privacy;
    this.privacy = newPrivacy;
    this.updatedAt = new Date();
    
    // Emit domain event for privacy change
    // Note: In a real DDD implementation, you'd want to emit this through an event dispatcher
  }

  public setAsCurrentLocation(): void {
    this.isCurrentLocation = true;
    this.updatedAt = new Date();
  }

  public unsetAsCurrentLocation(): void {
    this.isCurrentLocation = false;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  // Business Rule Methods
  public canBeSharedWith(requestingUser: User): boolean {
    if (this.privacy === LocationPrivacy.PUBLIC) {
      return true;
    }
    
    if (this.privacy === LocationPrivacy.PRIVATE) {
      return this.user.id === requestingUser.id;
    }
    
    if (this.privacy === LocationPrivacy.FRIENDS) {
      // TODO: Implement friend relationship check
      return this.user.id === requestingUser.id;
    }
    
    return false;
  }

  public isAccurate(): boolean {
    return this.accuracyLevel === LocationAccuracy.HIGH;
  }

  public isRecent(minutesThreshold = 10): boolean {
    const now = new Date();
    const diffMinutes = (now.getTime() - this.createdAt.getTime()) / (1000 * 60);
    return diffMinutes <= minutesThreshold;
  }

  // Value Object Getters
  public getLocationId(): LocationId {
    return LocationId.fromString(this.id);
  }

  public getCoordinates(): Coordinates {
    return Coordinates.create(this.latitude, this.longitude);
  }

  // Distance calculation to another location
  public distanceTo(other: Location): number {
    const thisCoords = this.getCoordinates();
    const otherCoords = other.getCoordinates();
    return thisCoords.distanceTo(otherCoords);
  }

  // Check if this location is within a certain radius of another location
  public isWithinRadius(other: Location, radiusKm: number): boolean {
    return this.distanceTo(other) <= radiusKm;
  }

  // Convert to GeoJSON representation
  public toGeoJSON(): any {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [this.longitude, this.latitude]
      },
      properties: {
        id: this.id,
        userId: this.user.id,
        accuracy: this.accuracy,
        accuracyLevel: this.accuracyLevel,
        source: this.source,
        privacy: this.privacy,
        address: this.address,
        city: this.city,
        country: this.country,
        isCurrentLocation: this.isCurrentLocation,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    };
  }

  // Get formatted address
  public getFormattedAddress(): string {
    const parts = [this.address, this.city, this.country].filter(Boolean);
    return parts.join(', ');
  }

  // Check if location has sufficient accuracy for features
  public hasSufficientAccuracy(): boolean {
    return this.accuracy ? this.accuracy <= 50 : true; // 50 meters threshold
  }
}