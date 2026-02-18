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
import { MessageSenderType, MessageType } from "@modules/message/message.enum";
import { CreateMessageCommand } from "../commands/create-message.command";

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
    void client.join(room);
    client.emit(Event.Joined, { room })
  }

  /**
   * 
   * @param client socker client
   * @param data { room: chatid, sender: chatId, type: messageType, content: messageContent } 
   */
  @SubscribeMessage(Event.SendMessage)
  async handleSendMessage(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: { room: string, sender: string, type: MessageType, content: string }
  ) {
    const { messageId } = await this.commandBus.execute(
      new CreateMessageCommand(
        data.room,
        {
          id: data.sender,
          type: MessageSenderType.AGENT
        },
        data.content,
        data.type
      )
    );

    this.server.to(data.room).emit(Event.ReceivedMessage, {
      id: messageId,
      content: data.content
    });
    this.logger.debug({ messageId }, 'Send message');

  }

  handleConnection(client: Socket, ..._args: any[]) {
    this.logger.debug(client.handshake, 'client connection')
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(client.handshake, 'client disconnect')
  }
}