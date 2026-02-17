import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatsService } from '../chats.service';
import { ChatDto, UpdateChatDto } from '../dto/chat.dto';
import { type AuthUser, CurrentUser } from '@auth';
import { MessageService } from '@modules/message/message.services';
import { ChatAssignExceptionFilter } from '../filters/chat-assign.filter';
import { ChatAssignDto } from '../dto/chat-assign.dto';

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

  @Get('assignments/:chatId')
  assignments(@Param('chatId') id: string) {
    return this.service.getAssigments(id);
  }

  @UseFilters(ChatAssignExceptionFilter)
  @Post('assign')
  @HttpCode(HttpStatus.ACCEPTED)
  async assign(@Body() { chatId, agentId }: ChatAssignDto) {
    const res = await this.service.assign(chatId, agentId)
    return {
      message: 'agent assignated',
      agent: res.agent.id,
      chat: res.chat.id
    };
  }

  @Get('list')
  list(@Query('agentId') id?: string) {
    return this.service.list(id);
  }

  @Get('/list')
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.getChats(user.id);
  }

  @Get(':id/messages')
  findMessages(@Param('id') id: string) {
    return this.messages.getChatMessages(id);
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
