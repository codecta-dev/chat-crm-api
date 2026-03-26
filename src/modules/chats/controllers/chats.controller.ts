import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatsService } from '../chats.service';
import { ChatDto, UpdateChatDto } from '../dto/chat.dto';
import { MessageService } from '@modules/message/message.services';
import { ChatAssignExceptionFilter } from '../filters/chat-assign.filter';
import { ChatAssignDto } from '../dto/chat-assign.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(
    private readonly service: ChatsService,
    private readonly messages: MessageService,
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file)
    return {
      message: 'Archivo recibido',
      filename: file.filename,
      size: file.size,
      pathFile: `/uploads/${file.filename}`,
    };
  }

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
