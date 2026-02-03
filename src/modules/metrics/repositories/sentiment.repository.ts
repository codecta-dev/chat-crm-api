import { DataSource } from "typeorm";
import { SentimentType } from "../metrics.types";
import { SentimentTopQuery, TrendPeriodQuery } from "../metrics.interface";
import { Injectable } from "@nestjs/common";
import { period, PeriodTime } from "src/lib/period";
import { DATE_FORMAT_SQL } from "../constants/metrics.constants";

@Injectable()
export class SentimentRepository {
  constructor(private readonly dataSource: DataSource) { }

  async trendPeriod(
    periodTime: PeriodTime,
    userId?: string
  ): Promise<TrendPeriodQuery[]> {
    // === Period setup ===
    const { start, end } = period(periodTime);

    // === Query execution ===
    const query: Promise<TrendPeriodQuery[]> = this.dataSource.sql`
      SELECT 
        DATE_FORMAT(m.created_at, ${DATE_FORMAT_SQL[periodTime]}) as date,
        AVG(sa.score_pos) as avg_pos,
        AVG(sa.score_neu) as avg_neu,
        AVG(sa.score_neg) as avg_neg 
      FROM sentiment_analysis sa 
      INNER JOIN analysis a ON a.analysis_id = sa.analysis_id
      INNER JOIN messages m ON m.id = a.message_id 
      LEFT JOIN users u ON u.id = m.agent_id
      WHERE m.created_at BETWEEN ${start} AND ${end}
        AND u.id = COALESCE(${userId}, u.id)
      GROUP BY date
      ORDER By date
    `;

    return query;
  }

  async topAgent(label?: SentimentType, limit: number = 5): Promise<SentimentTopQuery[]> {
    return this.dataSource.sql`
      SELECT 
        u.id AS id,
        u.username AS username,
        COUNT(sa.sentiment_analysis_id) AS total,
        AVG(sa.score_pos) AS avgPos,
        AVG(sa.score_neu) AS avgNeu,
        AVG(sa.score_neg) AS avgNeg
      FROM messages m
      INNER JOIN users u ON u.id = m.agent_id -- agent relation
      INNER JOIN analysis a ON a.message_id = m.id
      INNER JOIN sentiment_analysis sa ON sa.analysis_id = a.analysis_id
      WHERE sa.label = COALESCE(${label}, sa.label)
      GROUP BY sa.sentiment_analysis_id
      ORDER BY total DESC
      LIMIT ${limit}
    `;
  }

  async topClient(label?: SentimentType, limit: number = 5): Promise<SentimentTopQuery[]> {
    return this.dataSource.sql`
      SELECT 
        c.id AS id,
        c.username AS username,
        COUNT(sa.sentiment_analysis_id) AS total,
        AVG(sa.score_pos) AS avgPos,
        AVG(sa.score_neu) AS avgNeu,
        AVG(sa.score_neg) AS avgNeg
      FROM messages m
      INNER JOIN contacts c ON c.id = m.contact_id -- contact relation
      INNER JOIN analysis a ON a.message_id = m.id
      INNER JOIN sentiment_analysis sa ON sa.analysis_id = a.analysis_id
      WHERE sa.label = COALESCE(${label}, sa.label)
      GROUP BY sa.sentiment_analysis_id
      ORDER BY total DESC
      LIMIT ${limit}
    `;
  }
}