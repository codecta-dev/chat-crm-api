import { SentimentLabel } from "./sentiment.enum";

export interface SentimentResponse {
  text: string;
  label: SentimentLabel;
  probabilities: Record<SentimentLabel, number>;
}