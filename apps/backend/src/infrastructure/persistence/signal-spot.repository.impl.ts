import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { SignalSpot, SpotStatus } from '../../domain/signal-spot/entities/signal-spot.entity';
import { SignalSpotRepository, FindNearbyOptions } from '../../domain/signal-spot/repositories/signal-spot.repository.interface';
import { SpotId } from '../../domain/signal-spot/value-objects/spot-id.value-object';
import { UserId } from '../../domain/user/value-objects/user-id.value-object';
import { SignalSpotEntity } from './entities/signal-spot.persistence-entity';

@Injectable()
export class SignalSpotRepositoryImpl implements SignalSpotRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: SpotId): Promise<SignalSpot | null> {
    const entity = await this.em.findOne(SignalSpotEntity, { id: id.toString() });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCreator(creatorId: UserId): Promise<SignalSpot[]> {
    const entities = await this.em.find(SignalSpotEntity, { 
      createdBy: creatorId.toString() 
    }, {
      orderBy: { createdAt: 'DESC' }
    });
    
    return entities.map(entity => this.toDomain(entity));
  }

  async findNearby(options: FindNearbyOptions): Promise<SignalSpot[]> {
    const qb = this.em.createQueryBuilder(SignalSpotEntity, 's');

    // Geographic query using ST_DWithin
    qb.where(
      `ST_DWithin(
        ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326),
        ST_SetSRID(ST_MakePoint(?, ?), 4326),
        ?
      )`,
      [options.location.getLongitude(), options.location.getLatitude(), options.radiusKm * 1000]
    );

    if (!options.includeExpired) {
      qb.andWhere({ status: { $ne: SpotStatus.EXPIRED } });
      qb.andWhere({ expiresAt: { $gt: new Date() } });
    }

    if (options.category) {
      qb.andWhere({ category: options.category });
    }

    qb.orderBy({ createdAt: 'DESC' });

    if (options.limit) {
      qb.limit(options.limit);
    }

    if (options.offset) {
      qb.offset(options.offset);
    }

    const entities = await qb.getResultList();
    return entities.map(entity => this.toDomain(entity));
  }

  async findActiveSpots(): Promise<SignalSpot[]> {
    const entities = await this.em.find(SignalSpotEntity, {
      status: SpotStatus.ACTIVE,
      expiresAt: { $gt: new Date() }
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findExpiredSpots(): Promise<SignalSpot[]> {
    const entities = await this.em.find(SignalSpotEntity, {
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: SpotStatus.EXPIRED }
      ]
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: SpotStatus): Promise<SignalSpot[]> {
    const entities = await this.em.find(SignalSpotEntity, { status });
    return entities.map(entity => this.toDomain(entity));
  }

  async countByUserAndDate(userId: UserId, date: Date): Promise<number> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.em.count(SignalSpotEntity, {
      createdBy: userId.toString(),
      createdAt: { $gte: date, $lt: nextDay }
    });
  }

  async save(spot: SignalSpot): Promise<void> {
    const entity = this.toPersistence(spot);
    
    const existingEntity = await this.em.findOne(SignalSpotEntity, { id: entity.id });
    
    if (existingEntity) {
      this.em.assign(existingEntity, entity);
    } else {
      this.em.persist(entity);
    }

    await this.em.flush();
  }

  async remove(spot: SignalSpot): Promise<void> {
    const entity = await this.em.findOne(SignalSpotEntity, { id: spot.id.toString() });
    if (entity) {
      this.em.remove(entity);
      await this.em.flush();
    }
  }

  private toDomain(entity: SignalSpotEntity): SignalSpot {
    return SignalSpot.reconstitute({
      id: entity.id,
      content: {
        title: entity.title,
        description: entity.description,
      },
      location: {
        latitude: entity.latitude,
        longitude: entity.longitude,
      },
      radius: entity.radius,
      category: entity.category,
      visibility: entity.visibility,
      createdBy: entity.createdBy,
      status: entity.status,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      updatedAt: entity.updatedAt,
      interactions: entity.interactions || [],
    });
  }

  private toPersistence(spot: SignalSpot): SignalSpotEntity {
    const entity = new SignalSpotEntity();
    entity.id = spot.id.toString();
    entity.title = spot.content.getTitle();
    entity.description = spot.content.getDescription();
    entity.latitude = spot.location.getLatitude();
    entity.longitude = spot.location.getLongitude();
    entity.radius = spot.radius.getValue();
    entity.category = spot.category;
    entity.visibility = spot.visibility;
    entity.createdBy = spot.createdBy.toString();
    entity.status = spot.status;
    entity.createdAt = spot.createdAt;
    entity.expiresAt = spot.expiresAt;
    entity.updatedAt = spot.updatedAt;
    entity.interactions = spot.interactions;
    return entity;
  }
}