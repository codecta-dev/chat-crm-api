import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { ChatGatewayEvent as Event } from "../chat.enum";
import { PinoLogger } from "nestjs-pino";
import { CommandBus } from "@nestjs/cqrs";
import { ForbiddenException } from "@nestjs/common";
import { SendChatMessageDto } from "../dto/send-chat-message.dto";
import { SendChatMessageCommand } from "@modules/chats/commands/send-chat-message.command";

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly logger: PinoLogger,
    private readonly commandBus: CommandBus,
  ) { this.logger.setContext(ChatGateway.name) }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage(Event.Join)
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() { room }: { room: string }) {
    const companyId = client.handshake.headers['x-company-id'];

    if (!companyId) {
      this.logger.error('Company context required')
      throw new ForbiddenException('Company context required');
    };

    void client.join(room);
    this.logger.debug(client.handshake, 'Client handshake')
    client.emit(Event.Joined, { room })
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
    void this.commandBus.execute(
      new SendChatMessageCommand(data)
    )
  }

  handleConnection(client: Socket, ..._args: any[]) {
    this.logger.debug(client.handshake, 'client connection')
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(client.handshake, 'client disconnect')
  }
}