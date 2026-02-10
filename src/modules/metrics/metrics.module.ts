import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { SentimentAnalysis } from '../whatsapp/entities/sentiment-analysis.entity';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { Message } from '@modules/message/message.entity';
import { MetricsRepository } from './metrics.repository';
import { SentimentRepository } from './repositories/sentiment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SentimentAnalysis, Message]),
    WhatsappModule,
  ],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    MetricsRepository,
    SentimentRepository,
  ],
  exports: [TypeOrmModule, MetricsService, SentimentRepository],
})
export class MetricsModule { }
