import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { PinoLogger } from 'nestjs-pino';
import { Server, Socket } from 'socket.io';
import { WhatsappService } from './whatsapp.service';
import { JwtPayload } from '../../auth/auth.types';
import { ChatsService } from '../chats/chats.service';
import { WhatsAppHttpException } from './exceptions/whatsapp.exceptions';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  namespace: 'whatsapp',
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type'],
  },
})
export class WhatsappGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly logger: PinoLogger,
    private readonly chatsService: ChatsService,
    private readonly userService: UsersService,
    private readonly whatsappService: WhatsappService,
  ) { this.logger.setContext(WhatsappGateway.name) }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const { user } = client.handshake.auth as { user: JwtPayload };
    void this.userService.online(user.sub);

    if (user.company) {
      void client.join(`company_${user.company}`);
      this.logger.debug(`Client ${client.id} joined company room: company_${user.company}`);
    } else {
      this.logger.debug(`Cliente conectado: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const { user } = client.handshake.auth as { user: JwtPayload };
    void this.userService.offline(user.sub);

    this.logger.debug(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join-chat')
  handleJoinChatRoom(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    void client.join(chatId);
    this.logger.debug(`Client ${client.id} join to chat ${chatId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { chat: string; to: string, body: string }) {
    this.logger.debug(`Mensaje recibido desde React: ${JSON.stringify(client.handshake.auth)}`);
    const auth = client.handshake.auth as JwtPayload;
    const isSent = await this.whatsappService.sendTextMessage(data.to, data.body, auth.company).catch((err: WhatsAppHttpException) => {
      client.emit('error-event', { type: err.type, message: err.message });
      return false;
    });

    if (!isSent) {
      this.logger.error('Error enviando mensaje a través de WhatsApp API');
      return;
    }

    const msg = await this.chatsService.addMessage(data.chat, {
      senderType: 'user',
      body: data.body,
      mediaUrl: undefined, // * This is optional
      direction: 'out',
      type: 'text' // * This is type message
    })

    this.logger.debug(`Mensaje guardado en DB: ${JSON.stringify(msg)}`);

    this.server.to(data.chat).emit('new-message', msg);
  }
}
