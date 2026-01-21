import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Analysis } from "./analysis.entity";
import { SentimentModule } from "./sentiment/sentiment.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Analysis]),
    SentimentModule,
  ]
}) export class AnalysisModule { }