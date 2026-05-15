import { Injectable } from '@nestjs/common';
import { startOfMonth, subMonths } from 'date-fns';
import { DataSource } from 'typeorm';
import { AgentQuery, ClientQuery, ContactQuery } from './metrics.interface';
import { period, PeriodTime } from '@lib/period';

export type Table = 'messages' | 'transfers' | 'chats' | 'contacts' | 'users';
export type SentimentType = 'POS' | 'NEU' | 'NEG';

type comparePeriodsParams = {
  targetTable: Table;
  column: string;
  timeUnit: PeriodTime;
};
type CompareParams = { target: Table; column: string; period: PeriodTime };

@Injectable()
export class MetricsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async comparePeriod(filters: CompareParams, whereClause?: string) {
    const curr = period(filters.period);
    const prev = period(filters.period, 1);

    const raw: { current: string; previous: string }[] = await this.dataSource
      .sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN created_at BETWEEN ${curr.start} AND ${curr.end} THEN ${() => filters.column} END) AS current,
        COUNT(DISTINCT CASE WHEN created_at BETWEEN ${prev.start} AND ${prev.end} THEN ${() => filters.column} END) AS previous
      FROM ${() => filters.target}
      WHERE ${() => filters.column} IS NOT NULL
        AND (${() => whereClause ?? '1=1'});
    `;

    return {
      current: parseInt(raw[0].current) || 0,
      previous: parseInt(raw[0].previous) || 0,
    };
  }

  async comparePeriods({
    targetTable,
    column = 'id',
    timeUnit,
  }: comparePeriodsParams) {
    const currentPeriod = period(timeUnit);
    const previousPeriod = period(timeUnit, 1);

    const currentStart = currentPeriod.start.toISOString();
    const currentEnd = currentPeriod.end.toISOString();
    const previousStart = previousPeriod.start.toISOString();
    const previousEnd = previousPeriod.end.toISOString();

    const raw: { current: string; previous: string }[] = await this.dataSource
      .sql`
      SELECT (
        SELECT COUNT(DISTINCT(${() => column})) FROM ${() => targetTable}
        WHERE created_at BETWEEN ${currentStart} AND ${currentEnd} 
        AND ${() => column} IS NOT NULL
      ) as current, (
        SELECT COUNT(DISTINCT(${() => column})) FROM ${() => targetTable}
        WHERE created_at BETWEEN ${previousStart} AND ${previousEnd} 
        AND ${() => column} IS NOT NULL
      ) as previous
    `;

    return {
      current: parseInt(raw[0].current) || 0,
      previous: parseInt(raw[0].previous) || 0,
    };
  }

  async getTopContacts(limit = 5) {
    const now = new Date();
    const start = startOfMonth<Date>(subMonths(now, 2));

    const results: ContactQuery[] = await this.dataSource.sql`
        SELECT 
          c.id,
          c.username,
          c.first_names AS firstNames,
          c.last_names AS lastNames,
          c.phone_number AS phoneNumber,
          c.profile,
          COUNT(m.id) AS count,
          RANK() OVER (ORDER BY COUNT(m.id) DESC) AS \'rank\'
        FROM messages m
        INNER JOIN contacts c ON m.contact_id = c.id
        WHERE m.created_at >= ${start}
        GROUP BY c.id
        ORDER BY count DESC, c.username
        LIMIT ${limit}`;

    return results; // MySQL returns COUNT(*) directly as a number
  }

  async getAgentsFast(
    label: SentimentType,
    limit: number = 5,
  ): Promise<AgentQuery[]> {
    const qb: AgentQuery[] = await this.dataSource.sql`
      SELECT 
        u.id AS agentId,
        u.username AS username,
        u.first_name AS firstName,
        u.last_name AS lastName,
        COUNT(sa.sentiment_analysis_id) AS total,
        AVG(sa.score_pos) AS avgPos,
        AVG(sa.score_neu) AS avgNeu,
        AVG(sa.score_neg) AS avgNeg
      FROM messages m
      INNER JOIN users u ON u.id = m.agent_id
      INNER JOIN analysis a ON a.message_id =m.message_id
      INNER JOIN sentiment_analysis sa ON sa.analysis_id = a.analysis_id
      GROUP BY sa.sentiment_analysis_id
      ORDER BY total DESC
      LIMIT ${limit}
    `;

    return qb;
  }

  async getBestClients(
    userId: string,
    label: SentimentType = 'POS',
    limit: number = 5,
  ): Promise<ClientQuery[]> {
    const qb: ClientQuery[] = await this.dataSource.sql`
      SELECT 
        c.id AS contactId,
        c.username AS username,
        COUNT(m.id) AS totalMessages,
        AVG(sa.pos) AS avgPos,
        COUNT(sa.id) AS totalPositive,
        COUNT(m.id) * AVG(sa.pos) AS score
      FROM message m
      INNER JOIN contacts c ON m.contact_id = c.id
      LEFT JOIN sentiment_analysis sa ON sa.message_id =m.message_id AND sa.label = ${label}
      WHERE m.agent_id = ${userId}
      GROUP BY c.id
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    return qb;
  }
}
