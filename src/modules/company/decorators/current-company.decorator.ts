import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestCompany } from '../company.guard';

export const CurrentCompany = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestCompany>();
    const companyId = request.companyId;
    return companyId;
  },
);
