import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export type RequestCompany = Request & { headers: { 'x-company-id': string }, companyId: string }

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ) {
    const req = context.switchToHttp().getRequest<RequestCompany>();
    const companyId = req.headers['x-company-id'];

    if (!companyId) throw new ForbiddenException('Company context required');

    req.companyId = companyId;

    return true;
  }
}
