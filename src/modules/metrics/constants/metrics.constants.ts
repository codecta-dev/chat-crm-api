import { PeriodTime } from "src/lib/period";
import { CompareMetric, Table } from "../metrics.types";
import { SentimentLabel } from "@modules/analysis/sentiment/sentiment.enum";

export const SENTIMENT_LABELS_MAP = {
  positive: SentimentLabel.POSITIVE,
  neutral: SentimentLabel.NEUTRAL,
  negative: SentimentLabel.NEGATIVE,
} as const;

export const COMPARE_PERIOD_CONFIG: Record<CompareMetric, { target: Table, column: string, where?: string }> = {
  chat: {
    column: 'id',
    target: 'chats'
  },
  message: {
    column: 'id',
    target: 'messages'
  },
  transfer: {
    column: 'id',
    target: 'transfers'
  },
  agent: {
    target: 'messages',
    column: 'sender_id',
    where: 'sender_type = "agent"'
  },
  client: {
    target: 'messages',
    column: 'sender_id',
    where: 'sender_type = "client"'
  }
} as const;

// Date format strings for SQL DATE_FORMAT function based on period time
export const DATE_FORMAT_SQL: Record<PeriodTime, string> = {
  // date: 'date subdate' -- format
  hour: '%H %i',
  day: '%W %H',
  week: "%u %W",
  month: "%b %d",
  year: "%Y %M",
} as const;