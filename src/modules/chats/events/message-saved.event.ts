import { Message } from "../../../entities/index";

export class MessageSavedEvent {
  constructor(
    public readonly message: Message,
  ) { }
}