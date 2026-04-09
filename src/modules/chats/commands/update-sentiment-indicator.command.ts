import { Command } from "@nestjs/cqrs";

export class UpdateSentimentIndicatorCommand extends Command<{
  chatId: string
}> {
  constructor(
    public readonly probabilities: {
      pos: number,
      neu: number,
      neg: number
    },
    public readonly chatId?: string,
  ) { super() }
}