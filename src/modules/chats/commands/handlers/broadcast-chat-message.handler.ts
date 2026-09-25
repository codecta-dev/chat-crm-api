import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BroadcastChatMessageCommand } from '../broadcast-chat-message.command';
import { ChatGateway } from '@modules/chats/gateways/chat.gateway';
import { PinoLogger } from 'nestjs-pino';
import { ChatGatewayEvent } from '@modules/chats/chat.enum';

@CommandHandler(BroadcastChatMessageCommand)
export class BroadcastChatMessageHandler
  implements ICommandHandler<BroadcastChatMessageCommand>
{
  constructor(
    private readonly gateway: ChatGateway,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BroadcastChatMessageCommand.name);
  }

  async execute(command: BroadcastChatMessageCommand): Promise<{ id: string }> {
    if (command.chatId) {
      this.logger.debug(
        `This is room occupied: ${await this.gateway.hasSockets(command.chatId)}`,
      );

      this.gateway.server
        .to(command.chatId)
        .emit(ChatGatewayEvent.BroadcastMessage, command.payload);
      this.logger.debug(command, 'Broadcast message');
    } else {
      this.logger.error('ChatId NO defined in message');
    }

    return Promise.resolve({ id: command.id });
  }
}
