import { ClsService } from 'nestjs-cls';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Payload } from '@auth';

interface RequestAuth extends Request {
  user: Payload;
}

export function setupHttpContext(cls: ClsService, context: ExecutionContext) {
  const req = context.switchToHttp().getRequest<RequestAuth>();
  const companyId = req.headers['x-company-id'] as string;
  const userId = req.user?.sub;

  cls.set('company.id', companyId);
  cls.set('user.id', userId);
}
