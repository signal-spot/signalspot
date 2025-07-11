import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User, UserStatus } from '../../entities/user.entity';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user is verified and active
    if (user.status !== UserStatus.VERIFIED) {
      throw new ForbiddenException('Email verification required');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    if (user.accountLocked) {
      throw new ForbiddenException('Account is locked');
    }

    return true;
  }
}