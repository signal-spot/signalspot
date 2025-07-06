import { Injectable } from '@nestjs/common';
import { SignalSpot, SpotCategory, SpotVisibility } from '../../../domain/signal-spot/entities/signal-spot.entity';
import { SignalSpotRepository } from '../../../domain/signal-spot/repositories/signal-spot.repository.interface';
import { UserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { UserId } from '../../../domain/user/value-objects/user-id.value-object';
import { CreateSpotCommand } from '../commands/create-spot.command';
import { BusinessRuleViolationException } from '../../../domain/shared/exceptions/domain.exception';

export interface CreateSpotResult {
  spotId: string;
  expiresAt: Date;
}

@Injectable()
export class CreateSpotHandler {
  constructor(
    private readonly spotRepository: SignalSpotRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async handle(command: CreateSpotCommand): Promise<CreateSpotResult> {
    // 1. Validate user exists and is verified
    const userId = UserId.create(command.createdBy);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new BusinessRuleViolationException('User not found');
    }

    if (!user.isVerified) {
      throw new BusinessRuleViolationException('Only verified users can create spots');
    }

    // 2. Check daily creation limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.spotRepository.countByUserAndDate(userId, today);
    
    if (todayCount >= 3) {
      throw new BusinessRuleViolationException('Daily spot creation limit reached (3 spots per day)');
    }

    // 3. Validate category and visibility
    const category = this.validateCategory(command.category);
    const visibility = this.validateVisibility(command.visibility);

    // 4. Create the spot
    const spot = SignalSpot.create({
      content: {
        title: command.title,
        description: command.description,
      },
      location: {
        latitude: command.latitude,
        longitude: command.longitude,
      },
      radius: command.radius,
      category,
      visibility,
      createdBy: command.createdBy,
      durationHours: command.durationHours,
    });

    // 5. Save the spot
    await this.spotRepository.save(spot);

    return {
      spotId: spot.id.toString(),
      expiresAt: spot.expiresAt,
    };
  }

  private validateCategory(category: string): SpotCategory {
    if (!Object.values(SpotCategory).includes(category as SpotCategory)) {
      throw new BusinessRuleViolationException('Invalid spot category');
    }
    return category as SpotCategory;
  }

  private validateVisibility(visibility: string): SpotVisibility {
    if (!Object.values(SpotVisibility).includes(visibility as SpotVisibility)) {
      throw new BusinessRuleViolationException('Invalid spot visibility');
    }
    return visibility as SpotVisibility;
  }
}