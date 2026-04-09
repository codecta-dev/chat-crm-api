import { IsIn } from "class-validator";

export class SentimentTopParams {
  @IsIn(['agents', 'clients'])
  type: 'agents' | 'clients';
}