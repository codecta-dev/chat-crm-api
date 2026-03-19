import { WhatsAppConfig } from "@entities";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom, map, retry, throwError, timer } from "rxjs";
import { Response } from "express";
import { WhatsAppPayload } from "../interfaces/whatsapp-message.interface";
import { PinoLogger } from "nestjs-pino";
import { AxiosError } from 'axios';
import { WhatsAppErrorResponse } from "../interfaces/whatsapp.interface";

@Injectable()
export class WhatsAppClient {
  private phoneNumberId?: string;

  constructor(
    private readonly http: HttpService,
    private readonly logger: PinoLogger,
  ) { this.logger.setContext(WhatsAppClient.name) }

  setConfig(config: WhatsAppConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.http.axiosRef.defaults.baseURL = `${config.apiBaseUrl}/${config.apiVersion}`;
    this.http.axiosRef.defaults.headers.common['Authorization'] = `Bearer ${config.accessToken}`;
    this.http.axiosRef.defaults.headers.common['Content-Type'] = 'application/json';

    this.logger.debug(`Configured for phoneNumberId=${this.phoneNumberId}`);
  }

  private ensureConfigured() {
    const baseUrl = this.http?.axiosRef?.defaults?.baseURL;

    if (!this.phoneNumberId || !baseUrl) {
      this.logger.error(
        { phone: this.phoneNumberId, baseUrl },
        'WhatsAppClient no configurado. Llama a setConfig() antes de usar.'
      );
      throw new Error('WhatsAppClient not configured. Call setConfig() before using.');
    }

    this.logger.debug(
      { phone: this.phoneNumberId, baseUrl },
      'WhatsAppClient configurado correctamente'
    );
  }

  async send(payload: WhatsAppPayload) {
    this.ensureConfigured()

    const url = `${this.phoneNumberId}/messages`;

    this.logger.debug(`Sending ${payload.type} message to ${payload.to}`);

    const res$ = this.http.post<Response>(url, payload).pipe(
      retry({
        count: 5,
        delay: (err: AxiosError, retryCount) => {
          const errorData = err.response?.data as WhatsAppErrorResponse;

          if (errorData.error?.type === 'OAuthException') {
            this.logger.error(`Fatal WhatsApp error (no retry): ${errorData?.error?.message ?? err.message}`);
            return throwError(() => err);
          }

          this.logger.warn(`Retry ${retryCount}: WhatsApp error -> ${errorData.error?.message ?? err.message}`);
          return timer(retryCount * 1000);
        },
      }),
      map(({ data }) => data),
    )

    return firstValueFrom(res$).catch((err: AxiosError) => {
      this.logger.error(`Send failed: ${err.message}`);
    });
  }
}