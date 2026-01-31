import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const CurrentSalon = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const salonId = request.user?.currentSalonId;

    if (!salonId) {
      throw new ForbiddenException('No salon context available. Please select a salon.');
    }

    return salonId;
  },
);
