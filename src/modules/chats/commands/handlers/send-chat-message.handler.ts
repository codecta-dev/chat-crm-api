import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { SendChatMessageDto } from "@modules/chats/dto/send-chat-message.dto";
import { SendChatMessageCommand } from "../send-chat-message.command";
import { PinoLogger } from "nestjs-pino";

@CommandHandler(SendChatMessageCommand)
export class SendChatMessageHandler implements ICommandHandler<SendChatMessageCommand> {
  constructor(
    @InjectQueue('chat') private readonly queue: Queue<SendChatMessageDto>,
    private readonly logger: PinoLogger
  ) { this.logger.setContext(SendChatMessageHandler.name) }

  execute(command: SendChatMessageCommand): Promise<{ chatId: string; }> {
    this.logger.debug('Execute Queue: Chat')
    void this.queue.add('send-message', command.data);

    return Promise.resolve({
      chatId: command.data.room
    })
  }

}