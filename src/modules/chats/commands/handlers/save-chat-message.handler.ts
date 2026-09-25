import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SaveChatMessageCommand } from "../save-chat-message.command";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { SendChatMessageDto } from "../../dto/send-chat-message.dto";
import { ChatMessageDto } from "../../dto/chat-message.dto";

@CommandHandler(SaveChatMessageCommand)
export class SaveChatMessageHandler implements ICommandHandler<SaveChatMessageCommand> {
  constructor(
    @InjectQueue('chat') private readonly queue: Queue<SendChatMessageDto | ChatMessageDto>
  ) { }
  execute({ data }: SaveChatMessageCommand): Promise<any> {
    return this.queue.add('save-message', data);
  }
}