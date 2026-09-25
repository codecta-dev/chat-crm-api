import { SentimentAnalysis } from "@entities";

export class SentimentAnalyzedEvent {
  constructor(
    public readonly chatId: string,
    public readonly sentiment: SentimentAnalysis
  ) { }
}