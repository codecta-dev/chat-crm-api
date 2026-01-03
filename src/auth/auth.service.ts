import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';
import { JwtPayload } from './auth.types';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async valid(pass: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pass, hash)
  }

  async sign(credentials: { username: string, password: string }): Promise<Partial<JwtPayload>> {
    const user = await this.userRepo.findOne({
      where: { username: credentials.username },
    });

    if (!user || !(await this.valid(credentials.password, user.password))) throw new UnauthorizedException();

    const payload = {
      sub: user.id,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
    };

    return payload;
  }

  refresh() {
    // TODO: implement refresh token logic
    return { message: 'Not implemented' }
  }
}
