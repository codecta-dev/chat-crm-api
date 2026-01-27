import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  addDays,
  addHours,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfToday,
  format,
  startOfDay,
  startOfMonth,
  startOfToday,
  subDays,
  subMonths
} from 'date-fns';
import { Between, IsNull, Repository } from 'typeorm';
import { Chat, Transfer } from '../chats/entities';
import { SentimentAnalysis } from '../whatsapp/entities/sentiment-analysis.entity';
import { MetricsRepository } from './metrics.repository';
import { getRange } from 'src/lib/range-date';

export interface TopAgentMetrics {
  agentId: string;
  agentName: string;
  totalPositive: number;
  averagePositiveScore: number;
  weightedScore: number;
}
type SentimentTrendRange = 'day' | 'week' | 'month' | 'year';

type SentimentType = 'POS' | 'NEU' | 'NEG';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Transfer) private transferRepo: Repository<Transfer>,
    @InjectRepository(SentimentAnalysis) private sentimentRepo: Repository<SentimentAnalysis>,
    private readonly repo: MetricsRepository
  ) { }

  async kpis() {
    const [activeChats, messagesThisMonth, agentsActive, transfersThisMonth] = await Promise.all([
      this.activeChats(),
      this.messageThiMonth(),
      this.agentActiveThiMonth(),
      this.transfersThisMonth(),
    ])

    return { activeChats, messagesThisMonth, agentsActive, transfersThisMonth };
  }

  buildKPI(current: number, previous: number): { value: number; porcentLastMonth: string } {
    const change = previous === 0 ? 0 : (current - previous) / previous;
    const percentage = (change * 100).toFixed(2);
    const sign = change >= 0 ? '+' : '';
    return {
      value: current,
      porcentLastMonth: `${sign}${percentage}%`,
    };
  }

  async activeChats() {
    const current = await this.chatRepo.count({
      where: {
        endedAt: IsNull(),
        deletedAt: IsNull()
      }
    })

    const previous = await this.chatRepo.count({
      where: {
        endedAt: IsNull(),
        deletedAt: IsNull(),
        createdAt: Between(
          startOfMonth(subMonths(new Date(), 1)),
          endOfMonth(subMonths(new Date(), 1))
        ),
      },
    })

    return this.buildKPI(current, previous)
  }

  async messageThiMonth() {
    const currentMonth = getRange('month', 0);
    const previousMonth = getRange('month', 1);

    const current = await this.repo.rangeCount('messages',
      currentMonth.start,
      currentMonth.end
    )

    const previous = await this.repo.rangeCount('messages',
      previousMonth.start,
      previousMonth.end
    )

    return this.buildKPI(current, previous)
  }

  async agentActiveThiMonth() {
    const currentMonth = getRange('month');
    const previousMonth = getRange('month', 1);

    const [current, previous] = await Promise.all([
      this.repo.rangeCount('messages', currentMonth.start, currentMonth.end, 'agent_id'),
      this.repo.rangeCount('messages', previousMonth.start, currentMonth.end, 'agent_id')
    ])

    return this.buildKPI(current, previous)
  }

  async transfersThisMonth() {
    const current = await this.transferRepo.count({
      where: {
        createdAt: Between(startOfMonth(new Date()), endOfMonth(new Date())),
        deletedAt: IsNull(),
      },
    });

    const previous = await this.transferRepo.count({
      where: {
        createdAt: Between(
          startOfMonth(subMonths(new Date(), 1)),
          endOfMonth(subMonths(new Date(), 1))
        ),
        deletedAt: IsNull(),
      },
    });

    return this.buildKPI(current, previous)
  }

  async getSentimentTrendByRange(
    range: SentimentTrendRange = 'week',
    userId?: string,
  ): Promise<{
    date: string;
    pos: number;
    neg: number;
    neu: number;
  }[]> {
    const now = new Date();
    let start: Date;
    const end: Date = now;
    let stepFn: (date: Date) => Date;
    let formatStr: string;
    let groupFormat: string;

    switch (range) {
      case 'day':
        start = subDays(now, 1);
        groupFormat = "%Y-%m-%d %H:00:00";
        formatStr = 'yyyy-MM-dd HH:00:00';
        stepFn = (d) => addHours(d, 1);
        break;
      case 'week':
        start = subDays(now, 7);
        groupFormat = "%Y-%m-%d";
        formatStr = 'yyyy-MM-dd';
        stepFn = (d) => addDays(d, 1);
        break;
      case 'month':
        start = subDays(now, 30);
        groupFormat = "%Y-%m-%d";
        formatStr = 'yyyy-MM-dd';
        stepFn = (d) => addDays(d, 1);
        break;
      case 'year':
        start = startOfMonth(subMonths(now, 11));
        groupFormat = "%Y-%m";
        formatStr = 'yyyy-MM';
        stepFn = (d) => addMonths(d, 1);
        break;
      default:
        start = subDays(now, 30);
        groupFormat = "%Y-%m-%d";
        formatStr = 'yyyy-MM-dd';
        stepFn = (d) => addDays(d, 1);
    }

    const qb = this.sentimentRepo
      .createQueryBuilder('sentiment')
      .innerJoin('sentiment.message', 'm')
      .select([
        `DATE_FORMAT(sentiment.createdAt, '${groupFormat}') AS date`,
        "AVG(sentiment.pos) AS pos",
        "AVG(sentiment.neg) AS neg",
        "AVG(sentiment.neu) AS neu",
      ])
      .where('sentiment.createdAt BETWEEN :start AND :end', { start, end });

    if (userId) {
      qb.leftJoin('m.agent', 'u')
        .andWhere('u.id = :userId', { userId });
    }

    const raw = await qb
      .groupBy(`DATE_FORMAT(sentiment.createdAt, '${groupFormat}')`)
      .orderBy('date', 'ASC')
      .getRawMany<{
        date: string;
        pos: string;
        neg: string;
        neu: string;
      }>();

    const result = raw.map(({ date, pos, neg, neu }) => ({
      date,
      pos: parseFloat(pos ?? '0'),
      neg: parseFloat(neg ?? '0'),
      neu: parseFloat(neu ?? '0'),
    }));

    return this.fillMissingData(result, start, end, stepFn, formatStr);
  }

  async sentimentToday() {
    const today = {
      start: startOfToday(),
      end: endOfToday()
    };
    const yesterday = {
      start: startOfDay(subDays(new Date(), 1)),
      end: endOfDay(subDays(new Date(), 1))
    }

    const current = await this.sentimentRepo
      .createQueryBuilder('sentiment')
      .select([
        'AVG(sentiment.pos) AS avgPos',
        'AVG(sentiment.neg) AS avgNeg',
        'AVG(sentiment.neu) AS avgNeu',
      ])
      .where('sentiment.createdAt BETWEEN :start AND :end', today)
      .getRawOne()
      .then((res: {
        avgPos: string | null;
        avgNeg: string | null;
        avgNeu: string | null
      }) => ({
        pos: parseFloat(res.avgPos ?? '0'),
        neg: parseFloat(res.avgNeg ?? '0'),
        neu: parseFloat(res.avgNeu ?? '0'),
      }))

    const previous = await this.sentimentRepo
      .createQueryBuilder('sentiment')
      .select([
        'AVG(sentiment.pos) AS avgPos',
        'AVG(sentiment.neg) AS avgNeg',
        'AVG(sentiment.neu) AS avgNeu',
      ])
      .where('sentiment.createdAt BETWEEN :start AND :end', yesterday)
      .getRawOne()
      .then((res: {
        avgPos: string | null;
        avgNeg: string | null;
        avgNeu: string | null
      }) => ({
        pos: parseFloat(res.avgPos ?? '0'),
        neg: parseFloat(res.avgNeg ?? '0'),
        neu: parseFloat(res.avgNeu ?? '0'),
      }))

    return {
      pos: this.buildKPI(current.pos, previous.pos),
      neg: this.buildKPI(current.neg, previous.neg),
      neu: this.buildKPI(current.neu, previous.neu),
    }
  }

  async getMonthlySentimentTrend(): Promise<{
    date: string; // 'YYYY-MM-DD'
    pos: number;
    neg: number;
    neu: number;
  }[]> {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const raw = await this.sentimentRepo
      .createQueryBuilder('sentiment')
      .select([
        "DATE(sentiment.createdAt) AS date",
        "AVG(sentiment.pos) AS pos",
        "AVG(sentiment.neg) AS neg",
        "AVG(sentiment.neu) AS neu",
      ])
      .where('sentiment.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(sentiment.createdAt)')
      .orderBy('DATE(sentiment.createdAt)', 'ASC')
      .getRawMany<{
        date: string; // 'YYYY-MM-DD'
        pos: string;
        neg: string;
        neu: string;
      }>();

    return raw.map(({ date, pos, neg, neu }) => ({
      date,
      pos: parseFloat(pos ?? '0'),
      neg: parseFloat(neg ?? '0'),
      neu: parseFloat(neu ?? '0'),
    }));
  }

  async getTopContacts() {
    return this.repo.getTopContacts()
  }

  private fillMissingData(
    data: { date: string; pos: number; neg: number; neu: number }[],
    start: Date,
    end: Date,
    stepFn: (date: Date) => Date,
    formatStr: string
  ) {
    const filled: typeof data = [];
    let current = start;

    while (current <= end) {
      const formatted = format(current, formatStr);
      const existing = data.find((r) => r.date === formatted);
      if (existing) {
        filled.push(existing);
      } else {
        filled.push({ date: formatted, pos: 0, neg: 0, neu: 0 });
      }
      current = stepFn(current);
    }

    return filled;
  }

  async getAgentsFast(label: SentimentType, limit: number = 5) {
    return this.repo.getAgentsFast(label, limit);
  }

  async getBestClients(userId: string) {
    return this.repo.getBestClients(userId);
  }
}
