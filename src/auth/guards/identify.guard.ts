import { Payload } from '@auth';
import { UsersService } from '@modules/users/users.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class IdentifyGuard implements CanActivate {
  constructor(private readonly userService: UsersService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const payload = req.user as Payload;
    const user = this.userService.identify(payload.sub)

    req.user = user;

    return true;
  }
}
