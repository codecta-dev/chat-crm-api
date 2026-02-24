import { WhatsAppConfig } from "@entities";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { WhatsAppMessageBuilder } from "../builders/whatsapp-message.builder";
import { firstValueFrom, map, retry, timer } from "rxjs";
import { Response } from "express";
import { WhatsAppPayload } from "../interfaces/whatsapp-message.interface";
import { PinoLogger } from "nestjs-pino";
import { AxiosError } from 'axios';
import { WhatsAppErrorResponse } from "../interfaces/whatsapp.interface";

@Injectable()
export class WhatsAppClient extends WhatsAppMessageBuilder {
  private phoneNumberId?: string;

  constructor(
    private readonly http: HttpService,
    private readonly logger: PinoLogger,
  ) { super(); this.logger.setContext(WhatsAppClient.name) }

  setConfig(config: WhatsAppConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.http.axiosRef.defaults.baseURL = `${config.apiBaseUrl}/${config.apiVersion}`;
    this.http.axiosRef.defaults.headers.common['Authorization'] = `Bearer ${config.accessToken}`;
    this.http.axiosRef.defaults.headers.common['Content-Type'] = 'application/json';

    this.logger.debug(`Configured for phoneNumberId=${this.phoneNumberId}`);
  }

  private ensureConfigured() {
    if (!this.phoneNumberId || !this.http.axiosRef.defaults.baseURL) {
      this.logger.debug({
        phone: this.phoneNumberId,
        baseUrl: this.http.axiosRef.defaults.baseURL
      }, `Config load, phone=${this.phoneNumberId} and baseUrl=${this.http.axiosRef.defaults.baseURL}`)
      throw new Error('WhatsAppClient not configured. Call setConfig() before using.');
    }
  }

  send(payload: WhatsAppPayload) {
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
            throw err;
          }

          this.logger.warn(`Retry ${retryCount}: WhatsApp error -> ${errorData.error?.message ?? err.message}`);
          return timer(retryCount * 1000);
        },
      }),
      map(({ data }) => data),
    )

    return firstValueFrom(res$);
  }
}