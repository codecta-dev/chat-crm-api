import { Command, ICommand } from "@nestjs/cqrs";

export class AnalyzeMessageCommand extends Command<{
  jobId?: string
}> implements ICommand {
  constructor(
    public readonly messageId: string,
    public readonly text: string,
    public readonly chatId?: string,
  ) { super() }
}