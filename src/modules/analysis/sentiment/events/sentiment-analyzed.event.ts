import { SentimentAnalysis } from "../../../../entities/index";

export class SentimentAnalyzedEvent {
  constructor(
    public readonly chatId: string,
    public readonly sentiment: SentimentAnalysis
  ) { }
}