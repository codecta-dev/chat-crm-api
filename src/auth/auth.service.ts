import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@modules/users/users.service';
import { Payload } from '@auth';

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
    payload: Payload,
    token: string
  }>> {
    const user = await this.userService.find({ username: credentials.username });

    if (!user || !(await this.valid(credentials.password, user.password))) throw new UnauthorizedException();

    const payload = {
      sub: user.id,
      company: 'no implemented yet'
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
