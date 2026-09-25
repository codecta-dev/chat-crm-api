// client
export const SENTIMENT_TIMEOUT = 3_000 as const;
export const SENTIMENT_RETRIES = 3 as const;

// gateway
export enum SentimentEvent {
  Analyse = 'sentiment:analyse',
  Update = 'sentiment:update',
  Calculate = 'sentiment:calculate'
};
