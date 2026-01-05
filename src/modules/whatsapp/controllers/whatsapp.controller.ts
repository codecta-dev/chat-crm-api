import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SentimentClient } from "../clients/sentiment.client";
import { SendMessageDto } from "../dto/send-message.dto";
import { WhatsappService } from "../whatsapp.service";
import { CurrentUser, type AuthUser } from "@auth";

@Controller('whatsapp')
@UseGuards(AuthGuard('jwt'))
export class WhatsappController {
  constructor(
    private readonly service: WhatsappService,
    private readonly client: SentimentClient,
  ) { }

  @Post('nlp')
  async analyze(@Body('text') text: string) {
    const res = await this.client.analyze(text);
    return {
      success: !!res,
      res
    }
  }

  @Post('send')
  async sendMessage(@Body() body: SendMessageDto) {
    const success = await this.service.sendMessage(body.to, body.message);
    return { success, message: 'Message sent' };
  }

  @Post('send/template')
  async sendTemplateMessage(@CurrentUser() user: AuthUser, @Body() body: { to: string }) {
    const success = await this.service.sendTemplateMessage(body.to, 'hello_world', 'en_US', user.companyId);
    return { success, message: 'Template message sent' };
  }
}