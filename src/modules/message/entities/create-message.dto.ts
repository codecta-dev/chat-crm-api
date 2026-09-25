import { IsEnum, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';
import { MessageType, MessageSenderType, MessageStatus, MessageDirection } from "../message.enum";

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  waMessageId?: string;

  @IsOptional()
  @IsString()
  replyToMessageId?: string;

  @IsEnum(MessageSenderType)
  senderType: MessageSenderType;

  @IsOptional()
  @IsString()
  body?: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @IsEnum(MessageStatus)
  status: MessageStatus;

  @IsEnum(MessageDirection)
  direction: MessageDirection;

  @IsOptional()
  reactions?: any;

  @IsUUID()
  contactId: string;
}
