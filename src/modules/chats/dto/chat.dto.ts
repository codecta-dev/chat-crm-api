import { createZodDto } from "nestjs-zod";
import { ChatSchema } from "../schemas/chat.schema";
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import { ChatStatus, ChatPriority, ChatChannel } from "../chat.enum";

export class ChatDto {
  @IsEnum(ChatStatus)
  @IsOptional()
  status: ChatStatus;

  @IsEnum(ChatPriority)
  @IsOptional()
  priority: ChatPriority;

  @IsEnum(ChatChannel)
  @IsOptional()
  channel: ChatChannel;

  @IsUUID()
  @IsNotEmpty()
  client_id: string;
}

export class CreateChatDto extends createZodDto(
  ChatSchema.omit({ id: true, lastMessageId: true, createdAt: true })
) { }

export class UpdateChatDto extends createZodDto(
  ChatSchema.partial().omit({ id: true, createdAt: true })
) { }

export class ChatResponseDto extends createZodDto(ChatSchema) { }