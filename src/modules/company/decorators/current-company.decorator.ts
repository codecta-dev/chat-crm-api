import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { HttpRequestCompany } from '../company.guard';

export const CurrentCompany = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<HttpRequestCompany>();
    const companyId = request.companyId;
    return companyId;
  },
);
