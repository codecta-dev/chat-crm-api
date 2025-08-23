/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'whatsapp',
  cors: { origin: '*' },
})
export class WhatsappGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: { to: string; text: string }) {
    console.log('📨 Mensaje desde React:', data);

    this.server.emit('message', {
      from: 'me',
      to: data.to,
      text: data.text,
      isSent: true,
    });
  }

  notifyIncomingMessage(msg: any) {
    this.server.emit('message', {
      from: msg.from,
      text: msg.text,
      isSent: false,
    });
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    void client.join(chatId);
    console.log(`Cliente ${client.id} unido al chat ${chatId}`);
  }

  emitIncomingMessage(chatId: string, message: any) {
    this.server.to(chatId).emit('newMessage', message);
  }
}
