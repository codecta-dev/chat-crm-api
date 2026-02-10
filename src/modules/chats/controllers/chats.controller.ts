import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatsService } from '../chats.service';
import { ChatDto, UpdateChatDto } from '../dto/chat.dto';
import { type AuthUser, CurrentUser } from '@auth';
import { MessageService } from '@modules/message/message.services';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(
    private readonly service: ChatsService,
    private readonly messages: MessageService,
  ) { }

  @Post()
  create(@Body() dto: ChatDto) {
    return this.service.create(dto);
  }

  @Get('/list')
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.getChats(user.id);
  }

  @Get(':id/messages')
  findMessages(@Param('id') id: string) {
    return this.messages.getChatMessages(id);
  }

  @Get(':id/assigned/:userId')
  assinedUser(@Param('id') id: string, @Param('userId') userId: string) {
    const result = this.service.assignedUser(id, userId);
    return { success: result }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.service.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
