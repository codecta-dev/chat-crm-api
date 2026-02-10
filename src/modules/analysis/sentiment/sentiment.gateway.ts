import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { PinoLogger } from "nestjs-pino";
import { Server } from "socket.io";

@WebSocketGateway({
  namespace: 'whatsapp',
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type'],
  },
})
export class SentimentGateway {
  constructor(
    private readonly logger: PinoLogger,
  ) { this.logger.setContext(SentimentGateway.name) }


  @WebSocketServer()
  server: Server;

  emitGlobalSentiment(chatId: string, data: any) {
    this.logger.debug(`Emitting global sentiment update for chat ${chatId}`);
    this.server.to(chatId).emit('sentiment:update', data);
  }
}