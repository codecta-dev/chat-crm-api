import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser, JwtPayload } from '../auth.types';
import { Request } from 'express';

export const factory = (
  data: keyof AuthUser | undefined,
  ctx: ExecutionContext
): AuthUser | AuthUser[keyof AuthUser] | undefined => {
  const request = ctx.switchToHttp().getRequest<Request>();

  // Yep, it's request.user.user — like a user inside a user.
  const { user } = request.user as JwtPayload;

  return data ? user[data] : user;
}

export const CurrentUser = createParamDecorator(factory);