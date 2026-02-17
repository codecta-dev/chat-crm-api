import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import type { // Usa 'type' para los tipos (interfaces/clases)
  WhatsappNotification,
  WhatsappNotificationValue
} from '@daweto/whatsapp-api-types'
import type { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import { WebhookService } from '../services/webhook.service';
import { WhatsAppConfigService } from '../services/whatsapp-config.service';

@Controller('whatsapp/webhook')
export class WhatsappWebhookController {
  constructor(
    // private readonly whatsappGateway: WhatsappGateway,
    private readonly whatsappConfig: WhatsAppConfigService,
    private readonly webhookService: WebhookService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(WhatsappWebhookController.name)
  }

  extractFromValue<T>(body: WhatsappNotification, key: keyof WhatsappNotificationValue): T[] {
    const result = body.entry
      ?.flatMap(entry => entry.changes ?? [])
      .map(change => change.value?.[key])
      .filter(items => Array.isArray(items))
      .flat() ?? [];

    return result as T[];
  }

  @Get()
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const config = await this.whatsappConfig.getActiveByVerifyToken(token);

    if (mode === 'subscribe' && token === config?.webhookVerifyToken) {
      this.logger.info('WEBHOOK VERIFIED')
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  // @Post()
  // async handleWebhook(@Body() body: WhatsappNotification, @Res() res: Response): Promise<Response> {
  //   void await this.webhookService.handleIncomingMessage(body).catch((err: Error) => {
  //     this.logger.error(`Error handling incoming message: ${err?.message}`, err.stack);
  //     this.logger.debug(`Payload: ${err.stack}`);
  //   });

  //   return res.sendStatus(HttpStatus.OK);
  // }
}

