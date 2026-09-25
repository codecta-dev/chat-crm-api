import { Message } from "@entities";

export class MessageSavedEvent {
  constructor(
    public readonly message: Message,
  ) { }
}