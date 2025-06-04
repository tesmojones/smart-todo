import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (data) {
      return user?.[data];
    }
    
    return user;
  },
);