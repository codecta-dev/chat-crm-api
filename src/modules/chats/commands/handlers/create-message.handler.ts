import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { MessageRepository } from "@modules/message/message.repository";
import { PinoLogger } from "nestjs-pino";
import { MessageSavedEvent } from "@modules/chats/events/message-saved.event";
import { CreateMessageCommand } from "../create-message.command";

@CommandHandler(CreateMessageCommand)
export class CreateMessageHandler implements ICommandHandler<CreateMessageCommand> {
  constructor(
    private readonly repository: MessageRepository,
    private readonly logger: PinoLogger,
    private readonly eventBus: EventBus,
  ) { this.logger.setContext(CreateMessageHandler.name) }

  async execute({ chatId, content, sender, type }: CreateMessageCommand): Promise<{ messageId: string; }> {
    const message = await this.repository.createFromChat(chatId, content, sender.id, sender.type, type);

    this.logger.debug({ message: message.id, content: message.content }, 'Saved message');
    this.eventBus.publish(new MessageSavedEvent(message));

    return { messageId: message.id }
  }
}