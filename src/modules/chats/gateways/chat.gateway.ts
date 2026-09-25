import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatGatewayEvent as Event } from '../chat.enum';
import { PinoLogger } from 'nestjs-pino';
import { CommandBus } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { SendChatMessageDto } from '../dto/send-chat-message.dto';
import { SendChatMessageCommand } from '@modules/chats/commands/send-chat-message.command';

interface AuthHandshake {
  companyId?: string;
  user?: string;
}

interface CustomSocket extends Socket {
  handshake: Socket['handshake'] & { auth: AuthHandshake };
}

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly logger: PinoLogger,
    private readonly commandBus: CommandBus,
  ) {
    this.logger.setContext(ChatGateway.name);
  }

  @WebSocketServer()
  server!: Server;

  @SubscribeMessage(Event.Join)
  handleJoin(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() { room }: { room: string },
  ) {
    const companyId =
      client.handshake.headers['x-company-id'] ??
      client.handshake.auth.companyId;

    if (!companyId) {
      this.logger.error('Company context required');
      throw new ForbiddenException('Company context required');
    }

    void client.join(room);
    this.logger.debug(client.handshake, 'Client Joined Room: ' + room);
    client.emit(Event.Joined, { room });
  }

  /**
   *
   * @param client socker client
   * @param data { room: chatid, sender: chatId, type: messageType, content: messageContent }
   */
  @SubscribeMessage(Event.SendMessage)
  handleSendMessage(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: SendChatMessageDto,
  ) {
    this.logger.debug('Execute Command: SentChatMessageCommand');
    void this.commandBus.execute(new SendChatMessageCommand(data));
  }

  async hasSockets(roomName: string): Promise<boolean> {
    const sockets = await this.server.in(roomName)?.fetchSockets();
    this.logger.debug(
      sockets.flatMap((socket) => socket.id),
      'Sockets connected',
    );
    return sockets !== undefined && sockets.length > 0;
  }

  handleConnection(client: Socket, ..._args: any[]) {
    this.logger.debug(client.handshake, 'client connection');
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(client.handshake, 'client disconnect');
  }
}
