import { OnQueueEvent, OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PinoLogger } from "nestjs-pino";
import { Message } from "@modules/message/message.entity";
import { SentimentAnalysis } from "../entities/sentiment-analysis.entity";
import { SentimentService } from "../services/sentiment.service";

@Processor('sentiment')
export class SentimentProcessor extends WorkerHost {
  constructor(
    private readonly service: SentimentService,
    private readonly logger: PinoLogger,
  ) { super() }

  async process(job: Job<Message>) {
    const message = job.data;
    switch (job.name) {
      case 'analyze': {
        this.logger.debug("Sentiment Analysis process")
        const analysis = await this.service.save(message)
        const global = await this.service.getGlobalChatSentiment(message.chat.id)

        this.service.emitGlobalSentiment(message.chat.id, global)

        return analysis
      }
    }
  }

  @OnQueueEvent('completed')
  onCompleted(job: Job<SentimentAnalysis>) {
    const analysis = job.data;
    this.logger.debug(`Sentiment save in database with job ${job.id} with "${analysis.label}"`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} falló: ${error.message}`)
  }
}