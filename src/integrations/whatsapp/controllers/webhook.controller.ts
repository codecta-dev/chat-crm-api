import type { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { CommandBus } from '@nestjs/cqrs';
import {
  Controller, HttpStatus,
  Body, Get, Post, Query, Res
} from '@nestjs/common';
import type {
  WhatsappNotification,
  WhatsappNotificationValue
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

    res.sendStatus(HttpStatus.OK)

    const change = payload.entry[0].changes[0].value;
    if (!change.messages?.length) return;

    const messages = mapWebhookToMessages(payload);

    for (const msg of messages) {
      void this.commandBus.execute(new ReceiveWhatsAppMessageCommand(msg))
    }
  }
}

