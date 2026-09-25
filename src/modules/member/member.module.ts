import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { UsersModule } from '@modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { MemberController } from './member.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    UsersModule
  ],
  providers: [MemberService],
  exports: [MemberService],
  controllers: [MemberController]
})
export class MembersModule { }
