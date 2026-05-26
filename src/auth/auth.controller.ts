import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './auth.types';
import { IdentifyGuard, JwtAuthGuard } from './guards';
import { MemberService } from '@modules/member/member.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly member: MemberService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.service.sign(body);

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax', // 'none' in https
      secure: process.env.COOKIE_SECURE === '1',
    });

    return { message: 'Login Success' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('access_token');
    return { message: 'Logout success' };
  }

  @Get('me/companies')
  @UseGuards(JwtAuthGuard)
  getCompanies() {
    return this.member.getCompanies();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, IdentifyGuard)
  getProfile(@CurrentUser() user: AuthUser) {
    return user;
  }
}
