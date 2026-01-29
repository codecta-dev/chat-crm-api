import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  addDays,
  addHours,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
  subMonths
} from 'date-fns';
import { Repository } from 'typeorm';
import { SentimentAnalysis } from '../whatsapp/entities/sentiment-analysis.entity';
import { MetricsRepository, Table } from './metrics.repository';
import { MetricMapper } from './metrics.mapper';
import { KpiBuilder } from './builders/kpi.builder';
import { PeriodTime } from 'src/lib/period';

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
    @InjectRepository(SentimentAnalysis) private sentimentRepo: Repository<SentimentAnalysis>,
    private readonly repo: MetricsRepository
  ) { }

  async kpis() {
    const [activeChats, messagesThisMonth, agentsActive, transfersThisMonth] = await Promise.all([
      this.getPeriodKpi('chats', 'id'),
      this.getPeriodKpi('messages', 'id'),
      this.getPeriodKpi('messages', 'agent_id'),
      this.getPeriodKpi('transfers', 'id'),
    ])

    return { activeChats, messagesThisMonth, agentsActive, transfersThisMonth };
  }

  getKpi(current: number, previous: number) {
    return new KpiBuilder()
      .compare(current, previous, ['current', 'previous'])
      .percent('porcentChange')
      .build()
  }

  async getPeriodKpi(
    targetTable: Table,
    column: string,
    period: PeriodTime = 'month'
  ) {
    const { current, previous } = await this.repo.comparePeriods({
      targetTable,
      column,
      timeUnit: period,
    });

    return this.getKpi(current, previous);
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
    const queries = await this.repo.getAgentsFast(label, limit);
    return MetricMapper.toAgentMetrics(queries);
  }

  async getBestClients(userId: string) {
    const queries = await this.repo.getBestClients(userId);

    return MetricMapper.toBestClients(queries);
  }
}
