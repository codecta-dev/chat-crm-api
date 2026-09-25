import { IsIn } from 'class-validator';
import type { PeriodTime } from '@lib/period';

export class CompareQuery {
  @IsIn(['hour', 'day', 'week', 'month'])
  period: PeriodTime;
}
