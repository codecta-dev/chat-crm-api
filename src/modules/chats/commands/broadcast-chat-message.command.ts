import { Command } from "@nestjs/cqrs";
import { BroadcastDto } from "../dto/broadcast.dto";

export class BroadcastChatMessageCommand extends Command<{ id: string }> {
  constructor(
    public readonly id: string,
    public readonly payload: BroadcastDto,
    public readonly chatId?: string,
  ) { super() }
}