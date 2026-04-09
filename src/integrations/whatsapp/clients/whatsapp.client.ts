import { WhatsAppConfig } from "@entities";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom, map, retry, switchMap, throwError, timer } from "rxjs";
import { Response } from "express";
import { WhatsAppPayload } from "../interfaces/whatsapp-message.interface";
import { PinoLogger } from "nestjs-pino";
import { AxiosError } from 'axios';
import { WhatsAppErrorResponse } from "../interfaces/whatsapp.interface";
import { join } from "path";
import { writeFileSync } from "fs";
import { CommandBus } from "@nestjs/cqrs";
import { FailWhatsAppMessageCommand } from "@modules/chats/commands";

@Injectable()
export class WhatsAppClient {
  private phoneNumberId?: string;

  constructor(
    private readonly http: HttpService,
    private readonly logger: PinoLogger,
    private readonly commandBus: CommandBus,
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

  upload(mediaId: string) {
    return this.http.get<{
      id: string,
      messaging_product: "whatsapp",
      url: string,
      mime_type: string,
      sha256: string,
      file_size: number

    }>(`https://graph.facebook.com/v22.0/${mediaId}`)
      .pipe(
        switchMap((res) => {
          const mediaUrl = res.data.url;

          return this.http.get(mediaUrl, {
            responseType: 'arraybuffer'
          }).pipe(
            map((imageRes) => {
              const filename = `${mediaId}.jpg`;
              const filePath = join(process.cwd(), 'uploads', filename);

              writeFileSync(filePath, imageRes.data);

              return {
                imageUrl: `/uploads/${filename}`,
              }
            })
          )
        })
      )
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
            void this.commandBus.execute(new FailWhatsAppMessageCommand(payload.to, {
              code: errorData.error.code,
              error_data: errorData.error.error_data ?? { details: 'Requeste whatsapp client error for ' + payload.type + ' message' },
              message: errorData.error.message,
              title: 'Whatsapp cliente error'
            }));
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