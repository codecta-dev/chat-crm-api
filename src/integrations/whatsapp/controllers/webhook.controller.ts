import type { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { CommandBus } from '@nestjs/cqrs';
import {
  Controller, HttpStatus,
  Body, Get, Post, Query, Res
} from '@nestjs/common';
import type {
  WhatsappNotification,
} from '@daweto/whatsapp-api-types'

import { WebhookQuery } from '../dto/webhook.query.dto';
import { WhatsAppService } from '../whatsapp.service';
import { mapWebhookToMessages } from '../mappers/whatsapp-message.mapper';
import { ReceiveWhatsAppMessageCommand } from '../commands/receive-whatsapp-message.command';

@Controller('integration/webhook/whatsapp')
export class WebhookController {
  constructor(
    private readonly service: WhatsAppService,
    private readonly commandBus: CommandBus,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(WebhookController.name)
  }

  @Get()
  async verifyWebhook(
    @Query() {
      ['hub.mode']: mode,
      ['hub.challenge']: challenge,
      ['hub.verify_token']: verify_token
    }: WebhookQuery,
    @Res() res: Response,
  ) {
    const isValid = await this.service.verifyToken(verify_token);

    if (mode === 'subscribe' && isValid) {
      this.logger.debug('Webhook Verified')
      res.send(challenge);
    } else {
      res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  @Post()
  receiveMessage(@Body() payload: WhatsappNotification, @Res() res: Response) {
    // this.logger.debug('Recibe del webhook');
    this.logger.debug(payload, 'Webhook object');
    this.logger.debug(JSON.stringify(payload.entry[0].changes[0].value), 'Webhook change');


    // IMPORTANT: Always respond with 200 OK first, 
    // otherwise WhatsApp will keep retrying the webhook endlessly.
    res.sendStatus(HttpStatus.OK)

    const change = payload.entry[0].changes[0].value;
    if (!change.messages?.length) return;

    const messages = mapWebhookToMessages(payload);

    for (const msg of messages) {
      void this.commandBus.execute(new ReceiveWhatsAppMessageCommand(msg))
    }
  }
}

