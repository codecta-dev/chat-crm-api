import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SentimentAnalysis } from "./sentiment.entity";
import { SentimentGateway } from './gateways/sentiment.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([SentimentAnalysis])
  ],
  providers: [SentimentGateway],
}) export class SentimentModule { }