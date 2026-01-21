import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "@modules/message/message.entity";
import { SentimentClient } from "../clients/sentiment.client";
import { SentimentAnalysis } from "../entities/sentiment-analysis.entity";
import { SentimentGateway } from "../gateways/sentiment.gateway";

@Injectable()
export class SentimentService {
  constructor(
    @InjectRepository(SentimentAnalysis)
    private readonly repo: Repository<SentimentAnalysis>,
    private readonly gateway: SentimentGateway,
    private readonly client: SentimentClient,
  ) { }

  emitGlobalSentiment(chatId: string, data: any) {
    this.gateway.emitGlobalSentiment(chatId, data);
  }

  async save(message: Message) {
    const { probabilities, label } = await this.client.analyze(message.body);

    const data = this.repo.create({
      message: message,
      model: 'default',
      label,
      pos: probabilities.POS,
      neu: probabilities.NEU,
      neg: probabilities.NEG,
    });

    const analysis = await this.repo.save(data);

    return analysis
  }

  async getGlobalChatSentiment(chatId: string) {
    const result = await this.repo
      .createQueryBuilder('sentiment')
      .innerJoin('sentiment.message', 'message')
      .select([
        'AVG(sentiment.pos) AS avgPos',
        'AVG(sentiment.neg) AS avgNeg',
        'AVG(sentiment.neu) AS avgNeu',
        'COUNT(sentiment.id) AS totalMessages',
      ])
      .where('message.ChatId = :chatId', { chatId })
      .andWhere('message.direction = :direction', { direction: 'in' })
      .getRawOne<{
        avgPos: string
        avgNeg: string
        avgNeu: string
        totalMessages: string
      }>()

    if (!result) return null

    const avgPos = parseFloat(result.avgPos ?? '0')
    const avgNeg = parseFloat(result.avgNeg ?? '0')
    const avgNeu = parseFloat(result.avgNeu ?? '0')

    const dominant =
      avgPos > avgNeg && avgPos > avgNeu
        ? 'POS'
        : avgNeg > avgPos && avgNeg > avgNeu
          ? 'NEG'
          : 'NEU'

    return {
      chatId,
      avgPos,
      avgNeg,
      avgNeu,
      totalMessages: parseInt(result.totalMessages ?? '0'),
      dominant,
    }
  }
}