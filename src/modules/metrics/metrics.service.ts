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
  subHours,
  subMonths
} from 'date-fns';
import { Between, IsNull, Repository } from 'typeorm';
import { Chat, Message, Transfer } from '../chats/entities';
import { User } from '../users/entities/user.entity';
import { SentimentAnalysis } from '../whatsapp/entities/sentiment-analysis.entity';

export interface TopAgentMetrics {
  agentId: string;
  agentName: string;
  totalPositive: number;
  averagePositiveScore: number;
  weightedScore: number;
}
type SentimentTrendRange = 'day' | 'week' | 'month' | 'year';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Transfer) private transferRepo: Repository<Transfer>,
    @InjectRepository(SentimentAnalysis) private sentimentRepo: Repository<SentimentAnalysis>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) { }

  async kpis() {
    const [activeChats, messagesThisMonth, agentsActive, transfersThisMonth] = await Promise.all([
      this.activeChats(),
      this.messageThiMonth(),
      this.agentActiveByDay(),
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
    const now = new Date();

    const current = await this.messageRepo.count({
      where: {
        createdAt: Between(
          startOfMonth(now),
          endOfMonth(now)
        ),
        deletedAt: IsNull(),
      },
    })

    const previous = await this.messageRepo.count({
      where: {
        createdAt: Between(
          startOfMonth(subDays(new Date(), 1)),
          endOfDay(subDays(new Date(), 1))
        )
      }
    })

    return this.buildKPI(current, previous)
  }

  async agentActiveByDay() {
    const now = new Date()
    const todayStart = startOfMonth(now)
    const todayEnd = endOfMonth(now)
    const yesterdayStart = startOfMonth(subDays(now, 1))
    const yesterdayEnd = endOfMonth(subDays(now, 1))

    const current = await this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt BETWEEN :start AND :end', {
        start: todayStart,
        end: todayEnd,
      })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne<{ count: string }>()
      .then((res: { count: string }) => Number(res.count))

    const previous = await this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt BETWEEN :start AND :end', {
        start: yesterdayStart,
        end: yesterdayEnd,
      })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne<{ count: string }>()
      .then((res: { count: string }) => Number(res.count))

    return this.buildKPI(current, previous)
  }

  async agentActive() {
    const now = new Date();
    const threshold: Date = subHours(new Date(), 1);
    const previousThreshold = subHours(now, 2);

    const current = await this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt > :threshold', { threshold })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne<{ count: string }>()
      .then((res: { count: string }) => Number(res.count))

    const previous = await this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt BETWEEN :start AND :end', {
        start: previousThreshold,
        end: threshold,
      })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne()
      .then((res: { count: string }) => Number(res.count))

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
    const now = new Date();

    const results = await this.messageRepo
      .createQueryBuilder('message')
      .select('contact.id', 'id')
      .addSelect('contact.username', 'username')
      .addSelect('contact.firstNames', 'firstNames')
      .addSelect('contact.lastNames', 'lastNames')
      .addSelect('contact.phoneNumber', 'phoneNumber')
      .addSelect('contact.profile', 'profile')
      .addSelect('COUNT(*)', 'messageCount')
      .innerJoin('message.contact', 'contact')
      .where('message.createdAt >= :start', { start: startOfMonth<Date>(now) })
      .groupBy('contact.id')
      .orderBy('messageCount', 'DESC')
      .limit(5)
      .getRawMany<{
        id: string
        username: string
        firstNames: string
        lastNames: string
        phoneNumber: string
        profile?: string
        messageCount: number
      }>()

    return results
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

  async getBestAgents(): Promise<
    { agentId: string; agentName: string; totalPositive: number; avgPos: number; score: number }[]
  > {
    return this.sentimentRepo
      .createQueryBuilder('sa')
      .select('m.agentId', 'agentId')
      .addSelect('u.username', 'username')
      .addSelect('COUNT(sa.id)', 'totalPositive')
      .addSelect('AVG(sa.pos)', 'avgPos')
      .addSelect('COUNT(sa.id) * AVG(sa.pos)', 'score')
      .innerJoin('sa.message', 'm')
      .innerJoin('m.agent', 'u')
      .where("sa.label = :label", { label: 'POS' })
      .groupBy('m.agentId')
      .addGroupBy('username')
      .orderBy('score', 'DESC')
      .limit(5) // Top 5
      .getRawMany();
  }

  async getTopFiveAgents() {
    const results = await this.messageRepo
      .createQueryBuilder('message')
      .innerJoin('chats', 'chat', 'chat.id = message.ChatId')
      .innerJoin('users', 'agent', 'agent.id = chat.assignedAgentId')
      .innerJoin('sentiment_analysis', 'sentiment', 'sentiment.messageId = message.id')
      .select('chat.assignedAgentId', 'agentId')
      .addSelect('agent.firstNames', 'firstNames')
      .addSelect('agent.lastNames', 'lastNames')
      .addSelect('agent.username', 'username')
      .addSelect(
        'SUM(CASE WHEN sentiment.label = "POS" THEN 1 ELSE 0 END)',
        'totalPositive',
      )
      .addSelect('AVG(sentiment.pos)', 'avgPositiveScore')
      .addSelect('COUNT(message.id)', 'totalMessages')
      .where('message.agentId IS NULL') // Mensajes que NO enviaron los agentes
      .andWhere('message.direction = :direction', { direction: 'out' }) // Mensajes de clientes
      .andWhere('message.deletedAt IS NULL')
      .andWhere('chat.assignedAgentId IS NOT NULL')
      .groupBy('chat.assignedAgentId')
      .addGroupBy('agent.firstNames')
      .addGroupBy('agent.lastNames')
      .getRawMany<{
        agentId: string;
        firstNames: string;
        lastNames: string;
        totalPositive: string;
        avgPositiveScore: string;
        totalMessages: string;
        username: string;
      }>();

    // Calcular score ponderado y ordenar
    const metrics: TopAgentMetrics[] = results
      .map((row) => {
        const totalPositive = parseInt(row.totalPositive);
        const avgPositiveScore = parseFloat(row.avgPositiveScore) || 0;

        // Score ponderado: 60% total positivos, 40% promedio
        const weightedScore = (totalPositive * 0.6) + (avgPositiveScore * 100 * 0.4);

        return {
          agentId: row.agentId,
          agentName: row.firstNames && row.lastNames ? `${row.firstNames} ${row.lastNames}`.trim() : row.username,
          totalPositive,
          averagePositiveScore: Math.round(avgPositiveScore * 1000) / 1000,
          weightedScore: Math.round(weightedScore * 100) / 100,
        };
      })
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, 5);

    return metrics;
  }

  async getBestAgentsFast(): Promise<
    { agentId: string; agentName: string; totalPositive: number; avgPos: number; score: number }[]
  > {
    return this.messageRepo
      .createQueryBuilder('m')
      .innerJoin('users', 'u', 'm.agentId = u.id')
      .leftJoin('sentiment_analysis', 'sa', 'sa.messageId = m.id AND sa.label = :label', { label: 'POS' })
      .select('u.id', 'agentId')
      .addSelect('u.firstNames', 'firstNames')
      .addSelect('u.lastNames', 'lastNames')
      .addSelect('u.username', 'username')
      .addSelect('u.avatar', 'profile')
      .addSelect('u.phoneNumber', 'phoneNumber')
      .addSelect('COUNT(sa.id)', 'totalPositive')
      .addSelect('AVG(sa.pos)', 'avgPos')
      .addSelect('COUNT(sa.id) * AVG(sa.pos)', 'score')
      .groupBy('u.id')
      .addGroupBy('u.username')
      .orderBy('score', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getBestClients(userId: string): Promise<
    { clientId: string; clientName: string; totalMessages: number; avgSentiment: number; score: number }[]
  > {
    return this.messageRepo
      .createQueryBuilder('m')
      .innerJoin('contacts', 'c', 'm.contactId = c.id')
      .leftJoin('sentiment_analysis', 'sa', 'sa.messageId = m.id AND sa.label = :label', { label: 'POS' })
      .where('m.agentId = :agentId', { agentId: userId })
      .select('c.id', 'contactId')
      .addSelect('c.username', 'username')
      .addSelect('COUNT(m.id)', 'totalMessages')
      .addSelect('AVG(sa.pos)', 'avgPos')
      .addSelect('COUNT(sa.id)', 'totalPositive')
      .addSelect('COUNT(m.id) * AVG(sa.pos)', 'score')
      .groupBy('c.id')
      .orderBy('score', 'DESC')
      .limit(5)
      .getRawMany();
  }
}
