import { MessageSenderType } from '@modules/message/message.enum';
import { Command } from '@nestjs/cqrs';
import { WhatsAppMessageContent as MessageContent } from '@integrations/whatsapp/interfaces/whatsapp-message.interface';

export class CreateMessageCommand extends Command<{
  messageId: string;
}> {
  constructor(
    public readonly chatId: string,
    public readonly sender: { id: string; type: MessageSenderType },
    public readonly content: MessageContent,
  ) {
    super();
  }
}
