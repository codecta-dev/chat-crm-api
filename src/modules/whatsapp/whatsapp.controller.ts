/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { WhatsappGateway } from './whatsapp.gateway';


@Controller('whatsapp')
export class WebhookController {
  constructor(private readonly http: HttpService, private readonly whatsappGateway: WhatsappGateway) { }
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    console.log(mode, token, challenge);
    console.log(process.env.WHATSAPP_VERIFY_TOKEN);
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ WEBHOOK VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  @Post('webhook')
  handleWebhook(@Body() body: any, @Res() res: Response) {
    console.log('📩 Webhook recibido:', JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;  // número del usuario
      const text = message.text?.body;

      // Aquí notificas vía websocket al chat correspondiente
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.whatsappGateway.emitIncomingMessage(from, { from, text });
    }
    return res.sendStatus(200);
  }

  @Post('send')
  async sendMessage(@Body() body: { to: string; message: string }) {
    const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: body.to, // Ej: "51999999999"
      type: 'text',
      text: { body: body.message },
    };

    const headers = {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };


    const response = await this.http.axiosRef.post(url, payload, { headers });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  }
}

