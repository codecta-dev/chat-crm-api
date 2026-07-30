import { MessageType } from '@modules/message/domain/message.types';
import { IsNotEmptyObject } from 'class-validator';
import { ChatMessageContent } from '../chat.types';
import {
  MessageSenderType,
  MessageStatus,
} from '@modules/message/message.enum';

export class BroadcastDto {
  id!: string;

  chatId?: string;

  status!: MessageStatus;

  timestamp!: Date;

  @IsNotEmptyObject()
  sender!: {
    id: string;
    type: MessageSenderType;
  };

  @IsNotEmptyObject()
  msg!: {
    type: MessageType;
    mediaUrl?: string;
    content: ChatMessageContent;
  };
}
