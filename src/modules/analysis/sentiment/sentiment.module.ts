import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SentimentAnalysis } from "./sentiment.entity";
import { SentimentService } from "./sentiment.service";
import { SentimentClient } from "./sentiment.client";
import { BullModule } from "@nestjs/bullmq";
import { HttpModule } from "@nestjs/axios";
import { SentimentRepository } from "./sentiment.repository";
import { SentimentProcessor } from "./sentiment.processor";
import { ConfigModule } from "@nestjs/config";
import { AnalyseMessageHandler } from "./commands/handlers/analyse-message.handler";
import sentimentConfig from "src/config/sentiment.config";

@Module({
  imports: [
    ConfigModule.forFeature(sentimentConfig),
    TypeOrmModule.forFeature([SentimentAnalysis]),
    BullModule.registerQueue({
      name: 'sentiment'
    }),
    HttpModule,
  ],
  providers: [
    SentimentClient,
    SentimentService,
    SentimentProcessor,
    SentimentRepository,
    AnalyseMessageHandler,
  ],
}) export class SentimentModule { }