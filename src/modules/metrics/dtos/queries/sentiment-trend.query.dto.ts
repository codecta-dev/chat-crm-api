import { IsIn, IsNotEmpty } from "class-validator";

export class SentimentTrendQuery {
  @IsNotEmpty()
  @IsIn(['hour', 'day', 'week', 'month'])
  period: 'hour' | 'day' | 'week' | 'month';
}