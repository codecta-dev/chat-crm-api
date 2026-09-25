import { SentimentLabel } from "@modules/analysis/sentiment/sentiment.enum";
import type { SentimentActor, SentimentType } from "@modules/metrics/metrics.types";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class SentimentTopQuery {
  @IsNotEmpty()
  @IsIn(['agent', 'client'])
  actor: SentimentActor;

  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => {
    const normalized = value?.toString()?.toLowerCase();
    switch (normalized) {
      case 'positive': return 'POS';
      case 'neutral': return 'NEU';
      case 'negative': return 'NEG';
      default: return value;
    }
  })
  @IsEnum(
    SentimentLabel,
    { message: 'type must be one of the following values: positive, neutral, negative' }
  )
  type: SentimentType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 5;
}