import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AnalyzeMessageCommand } from "../analyze-message.command";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { SentimentPayload } from "../../sentiment.type";

@CommandHandler(AnalyzeMessageCommand)
export class AnalyseMessageHandler implements ICommandHandler<AnalyzeMessageCommand> {
  constructor(
    @InjectQueue('sentiment')
    private readonly queue: Queue<SentimentPayload & { chatId?: string }>,
  ) { }

  async execute(command: AnalyzeMessageCommand): Promise<{ jobId?: string }> {

    const job = await this.queue.add('sentiment', {
      messageId: command.messageId,
      text: command.text,
      chatId: command.chatId,
    });

    return { jobId: job.id }
  }

}