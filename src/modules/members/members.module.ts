import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [MembersService]
})
export class MembersModule { }
