import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './members.entity';
import { Repository } from 'typeorm';
import { UsersService } from '@modules/users/users.service';

type Credentials = { userId: string, companyId: string };

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
    private readonly users: UsersService,
  ) { }

  async find({ userId, companyId }: Credentials): Promise<Member[]> {
    return this.repo.find({
      where: { userId, companyId }
    })
  }
}
