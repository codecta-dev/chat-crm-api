import { Injectable } from "@nestjs/common";
import { SentimentClient } from "./sentiment.client";
import { SentimentRepository } from "./sentiment.repository";
import { SentimentPayload } from "./sentiment.type";

/**
 * @WIP This is service for analysis sentiment in messages for whatsapp and others
 */
@Injectable()
export class SentimentService {
  constructor(
    private readonly repo: SentimentRepository,
    private readonly client: SentimentClient,
  ) { }

  async analyze(text: string) {
    return this.client.analyze(text);
  }

  async saveAnalysis({ messageId, text }: SentimentPayload) {
    const analysis = await this.analyze(text);

    return await this.repo.save(analysis, messageId);
  }
}