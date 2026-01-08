import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { type UserSearchDto } from './dto/user-search.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { userTableQuerySchema, type UserTableQueryDto } from '../../common/schemas/user-table-query.schema';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly service: UsersService) { }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.service.importCsv(file);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.service.create(createUserDto);
  }

  @Post('table')
  @UsePipes(new ZodValidationPipe(userTableQuerySchema))
  getTable(@Body() query: UserTableQueryDto) {
    return this.service.table(query);
  }

  @Get("search")
  search(@Query() query: UserSearchDto) {
    return this.service.searchUser(query);
  }

  @Get()
  async all(): Promise<User[]> {
    return await this.service.all();
  }

  @Get(':username')
  @HttpCode(HttpStatus.ACCEPTED)
  find(@Param('username') username: string) {
    return this.service.find({ username });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.service.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
