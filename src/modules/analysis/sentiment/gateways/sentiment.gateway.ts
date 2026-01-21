import { UseInterceptors } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { ClsInterceptor } from 'nestjs-cls';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'analysis/sentiment',
})
@UseInterceptors(ClsInterceptor)
export class SentimentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() { }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(client.handshake.headers)
  }
  handleDisconnect(_client: any) {
    console.log("disconnet anaylsis/sentiment")
  }

  @SubscribeMessage('sentiment:calculate')
  handleSentiment(@MessageBody() data: { chatId: string }) {
    this.server.to(data.chatId).emit('sentiment:calculate:update', data);
  }
}
