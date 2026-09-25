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
    const user = this.userService.identify()

    req.user = user;

    return true;
  }
}
