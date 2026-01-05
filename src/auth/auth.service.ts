import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtPayload } from './auth.types';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async valid(pass: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pass, hash)
  }

  async sign(credentials: { username: string, password: string }): Promise<Partial<{
    payload: JwtPayload,
    token: string
  }>> {
    const user = await this.userService.find({ username: credentials.username });

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

    return {
      payload,
      token: await this.jwtService.signAsync(payload)
    };
  }

  refresh() {
    // TODO: implement refresh token logic
    return { message: 'Not implemented' }
  }
}
