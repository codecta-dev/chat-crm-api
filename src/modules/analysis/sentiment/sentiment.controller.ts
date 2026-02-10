import { Controller } from "@nestjs/common";
import { SentimentService } from "./sentiment.service";

/**
 * @WIP This controller connect with service (I don't know its use ✌️)
 */
@Controller('sentiment')
export class SentimentController {
  constructor(
    private readonly sentimentService: SentimentService
  ) { }

  // @Get('/chat/:chatId')
  // @HttpCode(HttpStatus.OK)
  // async getGlobalChatSentiment(@Param('chatId') chatId: string) {
  //   return this.sentimentService.getGlobalChatSentiment(chatId)
  // }
}