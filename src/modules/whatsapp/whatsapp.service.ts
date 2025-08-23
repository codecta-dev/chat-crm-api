import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

// import { CreateWhatsappDto } from './dto/create-whatsapp.dto';
// import { UpdateWhatsappDto } from './dto/update-whatsapp.dto';

@Injectable()
export class WhatsappService {
  private readonly apiUrl = "https://graph.facebook.com/v23.0";

  constructor(
    private readonly http: HttpService,
  ) { }

  async sendMessage(to: string, message: string) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/${phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: message },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);

      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error?.response?.data || 'Error sending message',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
