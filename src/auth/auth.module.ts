import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from 'src/auth/auth.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { WhatsappModule } from '../modules/whatsapp/whatsapp.module';
import { MembersModule } from '@modules/member/member.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret',
      signOptions: { expiresIn: '1d' },
    }),
    WhatsappModule,
    MembersModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule { }