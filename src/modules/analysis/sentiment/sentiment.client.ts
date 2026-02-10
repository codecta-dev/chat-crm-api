import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosError } from "axios";
import { PinoLogger } from "nestjs-pino";
import { catchError, firstValueFrom, map, retry, throwError, timeout } from "rxjs";

export interface SentimentResponse {
  text: string;
  label: 'NEG' | 'NEU' | 'POS';
  probabilities: {
    NEG: number;
    NEU: number;
    POS: number;
  };
}

@Injectable()
export class SentimentClient {
  private readonly url = process.env.IA_URL || "http://localhost:8000";
  constructor(
    private readonly http: HttpService,
    private readonly logger: PinoLogger,
  ) { }

  async analyze(text: string): Promise<SentimentResponse> {
    const res$ = this.http
      .post<SentimentResponse>(`${this.url}/analyze_message`, { text: text })
      .pipe(
        timeout(1000),
        retry(3),
        map((res) => {
          const data = res.data;
          this.logger.debug(`Raw response: ${JSON.stringify(data)}`);
          return data
        }),
        catchError((err: AxiosError) => {

          this.logger.debug(`Calling IA service at ${this.url}/analyze_message with text="${text}"`);
          this.logger.error(err.stack, 'Stack trace');

          return throwError(() => new Error('Sentiment service unavailable'));
        })
      )

    return await firstValueFrom(res$)
  }
}