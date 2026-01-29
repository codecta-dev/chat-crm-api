import { Injectable } from "@nestjs/common";
import { startOfMonth } from "date-fns";
import { DataSource } from "typeorm";
import { AgentQuery, ClientQuery } from "./metrics.interface";
import { period, PeriodTime } from "src/lib/period";

export type Table = 'messages' | 'transfers' | 'chats' | 'contacts' | 'users';
export type SentimentType = 'POS' | 'NEU' | 'NEG';

type comparePeriodsParams = { targetTable: Table, column: string, timeUnit: PeriodTime };

@Injectable()
export class MetricsRepository {
  constructor(private readonly dataSource: DataSource) { }

  async comparePeriods({ targetTable, column = 'id', timeUnit }: comparePeriodsParams) {
    const currentPeriod = period(timeUnit);
    const previousPeriod = period(timeUnit, 1);

    const currentStart = currentPeriod.start.toISOString();
    const currentEnd = currentPeriod.end.toISOString();
    const previousStart = previousPeriod.start.toISOString();
    const previousEnd = previousPeriod.end.toISOString();

    const raw: { current: string, previous: string }[] = await this.dataSource.sql`
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

  async getTopContacts() {
    const now = new Date();
    const start = startOfMonth<Date>(now);

    const results = await this.dataSource.query<{
      id: string
      username: string
      firstNames: string
      lastNames: string
      phoneNumber: string
      profile?: string
      messageCount: number
    }>(await this.dataSource.sql`
        SELECT 
          c.id,
          c.username,
          c.first_names AS firstNames,
          c.last_names AS lastNames,
          c.phone_number AS phoneNumber,
          c.profile,
          COUNT(*) AS messageCount
        FROM message m
        INNER JOIN contact c ON m.contact_id = c.id
        WHERE m.created_at >= ?
        GROUP BY c.id, c.username, c.first_names, c.last_names, c.phone_number, c.profile
        ORDER BY messageCount DESC
        LIMIT 5`,
      [start]
    );

    return results; // MySQL returns COUNT(*) directly as a number
  }

  async getAgentsFast(
    label: SentimentType,
    limit: number = 5
  ): Promise<AgentQuery[]> {
    const qb: AgentQuery[] = await this.dataSource.sql`
      SELECT 
        u.id AS agentId,
        ANY_VALUE(u.first_names) AS firstNames,
        ANY_VALUE(u.last_names) AS lastNames,
        COUNT(sa.id) AS total,
        AVG(sa.pos) AS avg,
        COUNT(sa.id) * AVG(sa.pos) AS score
      FROM message m
      INNER JOIN users u ON m.agent_id = u.id
      LEFT JOIN sentiment_analysis sa ON sa.message_id = m.id AND sa.label = ${label}
      GROUP BY u.id
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    return qb;
  }

  async getBestClients(userId: string, label: SentimentType = 'POS', limit: number = 5): Promise<ClientQuery[]> {
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
      LEFT JOIN sentiment_analysis sa ON sa.message_id = m.id AND sa.label = ${label}
      WHERE m.agent_id = ${userId}
      GROUP BY c.id
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    return qb;
  }
}
