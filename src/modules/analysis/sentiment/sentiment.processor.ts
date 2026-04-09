import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PinoLogger } from "nestjs-pino";
import { SentimentService } from "./sentiment.service";
import { EventBus } from "@nestjs/cqrs";
import { SentimentAnalysis } from "@entities";
import { MessageAnalyzedEvent } from "@modules/chats/events/message-analyzed.event";
import { SentimentPayload } from "./sentiment.type";

type SentimentJob = Job<SentimentPayload & { chatId?: string }>

@Processor('sentiment')
export class SentimentProcessor extends WorkerHost {
  constructor(
    private readonly service: SentimentService,
    private readonly logger: PinoLogger,
    private readonly event: EventBus
  ) { super(); this.logger.setContext(SentimentProcessor.name) }

  async process(job: SentimentJob) {
    return this.service.saveAnalysis(job.data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: SentimentJob, res: SentimentAnalysis) {
    if (job.data.chatId) {
      this.event.publish(new MessageAnalyzedEvent(job.data.messageId, res.id, {
        pos: res.scorePos,
        neu: res.scoreNeu,
        neg: res.scoreNeg,
      }, res.label, job.data.chatId));
    }

    this.logger.debug({
      id: res.id,
      chatId: job.data.chatId,
      analysisId: res.analysis.id,
      messageId: res.analysis.message.id
    }, 'Calculated Sentiment in message')
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(error, `Job ${job.id} failed: ${error.message}`)
  }
}