import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
    private readonly cls: ClsService,
  ) { }

  private get userId(): string {
    return this.cls.get('user.id');
  }

  private get companyId() {
    return this.cls.get('company.id');
  }

  async getMemberActive(): Promise<Member | null> {
    return this.repo.findOne({
      where: {
        user: { id: this.userId },
        company: { id: this.companyId }
      },
      loadRelationIds: true
    })
  }

  async getCompanies() {
    const members = await this.repo.find({
      where: {
        user: { id: this.userId }
      },
      loadRelationIds: {
        relations: ['company']
      }
    });

    return members?.map((member) => member.company) ?? []
  }
}
