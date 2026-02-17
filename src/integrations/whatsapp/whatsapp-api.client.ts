import { HttpService } from "@nestjs/axios";
import { HttpStatus, Injectable } from "@nestjs/common";
import { AxiosError } from 'axios';
import { PinoLogger } from "nestjs-pino";

import { WhatsAppHttpException } from "./exceptions/whatsapp.exceptions";
import { WhatsAppSendMessageResponse } from "./interfaces/whatsapp.interface";

@Injectable()
export class WhatsAppApiClient {
  constructor(
    private readonly http: HttpService,
    private readonly logger: PinoLogger
  ) { }

  async testConnection(url: string): Promise<boolean> {
    return this.http.axiosRef.get(url)
      .then(res => res.status == HttpStatus.OK.valueOf())
      .catch((err: AxiosError) => { throw new WhatsAppHttpException(err) });
  }

  async sendMessage(url: string, token: string, payload: any): Promise<boolean> {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const res = await this.http.axiosRef.post<WhatsAppSendMessageResponse>(url, payload, { headers }).catch((err: AxiosError) => {
      this.logger.error(`WhatsApp API Error: ${JSON.stringify(err.response?.data)}`);
      throw new WhatsAppHttpException(err);
    });

    this.logger.debug(`WhatsApp API Response: ${JSON.stringify(res.data)}`);
    return res.status === HttpStatus.OK.valueOf();
  }
}
