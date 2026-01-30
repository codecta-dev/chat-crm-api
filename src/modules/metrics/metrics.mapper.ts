import { KpiBuilder } from "./builders/kpi.builder";
import { AgentQuery, ClientQuery } from "./metrics.interface";

export class MetricMapper {

  static toAgentMetrics(queries: AgentQuery[]) {
    return queries.map((r) => ({
      agentId: r.agentId,
      agentName: `${r.firstNames} ${r.lastNames}`.trim(),
      total: Number(r.total),
      avg: Number(r.avg) || 0,
      score: Number(r.score) || 0
    }));
  }

  static toBestClients(queries: ClientQuery[]) {
    return queries.map((q) => ({
      clientId: q.contactId,
      clientName: q.username || 'Sin nombre',
      totalMessages: Number(q.totalMessages),
      avgSentiment: Number(q.avgPos) || 0,
      score: Number(q.score) || 0
    }));
  }

  static compare(label: string, values: [number, number]) {
    return new KpiBuilder()
      .label(label)
      .compare(values[0], values[1], ['previus', 'current'])
      .percent()
      .build();
  }
}