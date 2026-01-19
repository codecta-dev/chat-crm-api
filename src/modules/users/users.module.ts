import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CsvModule } from 'nest-csv-parser';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { IsInDatabaseConstraint } from '../../utils/validators/IsInDatabase';
import { Chat } from '../chats/entities';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Chat]),
    CsvModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, IsInDatabaseConstraint, UserRepository],
  exports: [UsersService]
})
export class UsersModule { }
