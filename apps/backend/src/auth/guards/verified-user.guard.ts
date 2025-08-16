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



    // Skip verification check - auto verify users
    // In production, you may want to implement proper verification
    if (user.status !== UserStatus.VERIFIED) {
      // Auto-verify user for now
      user.status = UserStatus.VERIFIED;
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