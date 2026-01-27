import { Injectable } from "@nestjs/common";
import { startOfMonth } from "date-fns";
import { DataSource } from "typeorm";
import { AgentMetric, AgentQuery, ClientMetric, ClientQuery } from "./metrics.interface";

type Table = 'messages' | 'contacts' | 'users';

export type SentimentType = 'POS' | 'NEU' | 'NEG';

@Injectable()
export class MetricsRepository {
  constructor(private readonly dataSource: DataSource) { }

  async rangeCount(table: Table, start: Date, end: Date, column?: string) {
    const selectColumn = column
      ? `COUNT(DISTINCT "${column}")`
      : 'COUNT(*)';

    const whereColumn = column
      ? `AND "${column}" IS NOT NULL`
      : '';

    const query = await this.dataSource.query<{ count: string }>(
      `SELECT ${selectColumn} as count
       FROM "${table}"
       WHERE "created_at" BETWEEN $1 AND $2
       ${whereColumn}`,
      [start, end]
    );

    return parseInt(query.count, 10)
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

    // MySQL returns COUNT(*) directly as a number
    return results;
  }

  async getAgentsFast(
    label: SentimentType,
    limit: number = 5
  ): Promise<AgentMetric[]> {
    const results = await this.dataSource.query<AgentQuery[]>(
      await this.dataSource.sql`
      SELECT 
        u.id AS agentId,
        ANY_VALUE(u.first_names) AS firstNames,
        ANY_VALUE(u.last_names) AS lastNames,
        COUNT(sa.id) AS total,
        AVG(sa.pos) AS avg,
        COUNT(sa.id) * AVG(sa.pos) AS score
      FROM message m
      INNER JOIN users u ON m.agent_id = u.id
      LEFT JOIN sentiment_analysis sa ON sa.message_id = m.id AND sa.label = ?
      GROUP BY u.id
      ORDER BY score DESC
      LIMIT ?
    `,
      [label, limit]
    );

    return results.map((r) => ({
      agentId: r.agentId,
      agentName: `${r.firstNames} ${r.lastNames}`.trim(),
      total: Number(r.total),
      avg: Number(r.avg) || 0,
      score: Number(r.score) || 0
    }));
  }

  async getBestClients(userId: string): Promise<ClientMetric[]> {
    const results = await this.dataSource.query<ClientQuery[]>(await this.dataSource.sql`
      SELECT 
        c.id AS contactId,
        c.username AS username,
        COUNT(m.id) AS totalMessages,
        AVG(sa.pos) AS avgPos,
        COUNT(sa.id) AS totalPositive,
        COUNT(m.id) * AVG(sa.pos) AS score
      FROM message m
      INNER JOIN contacts c ON m.contact_id = c.id
      LEFT JOIN sentiment_analysis sa ON sa.message_id = m.id AND sa.label = ?
      WHERE m.agent_id = ?
      GROUP BY c.id
      ORDER BY score DESC
      LIMIT 5
    `,
      ['POS', userId]
    );

    return results.map((r) => ({
      clientId: r.contactId,
      clientName: r.username || 'Sin nombre',
      totalMessages: Number(r.totalMessages),
      avgSentiment: Number(r.avgPos) || 0,
      score: Number(r.score) || 0
    }));
  }
}
