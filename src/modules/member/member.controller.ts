import { JwtAuthGuard } from '@auth/guards';
import { CompanyGuard } from '@modules/company/company.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('member')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class MemberController {
  constructor(
    private readonly service: MemberService,
  ) { }

  @Get('current')
  me() {
    return this.service.getMemberActive();
  }

  @Get('companies')
  companies() {
    return this.service.getCompanies();
  }
}
