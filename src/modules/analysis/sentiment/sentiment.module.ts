import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SentimentAnalysis } from "./sentiment.entity";
import { SentimentGateway } from './gateways/sentiment.gateway';
import { SentimentGateway as SentimentGatewayOld } from './sentiment.gateway';
import { SentimentService } from "./sentiment.service";
import { SentimentClient } from "./sentiment.client";
import { SentimentProcessor } from "./sentiment.processor";
import { SentimentController } from "./sentiment.controller";
import { BullModule } from "@nestjs/bullmq";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    TypeOrmModule.forFeature([SentimentAnalysis]),
    BullModule.registerQueue({
      name: 'sentiment'
    }),
    HttpModule,
  ],
  controllers: [SentimentController],
  providers: [
    SentimentGateway,
    SentimentGatewayOld, // This will be removed in the future - WIP
    SentimentClient,
    SentimentProcessor,
    SentimentService,
  ],
}) export class SentimentModule { }