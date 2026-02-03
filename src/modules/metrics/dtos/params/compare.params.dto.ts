import type { CompareMetric } from "@modules/metrics/metrics.types";
import { IsIn } from "class-validator";

export class CompareParams {
  @IsIn(['agent', 'chat', 'message', 'transfer'])
  metric: CompareMetric;
}