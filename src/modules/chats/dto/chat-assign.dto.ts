import { IsNotEmpty, IsUUID } from "class-validator";

export class ChatAssignDto {
  @IsUUID()
  @IsNotEmpty()
  chatId: string;

  @IsUUID()
  @IsNotEmpty()
  agentId: string;
}