export interface AgentQuery {
  agentId: string
  firstNames: string
  lastNames: string
  username: string
  profile: string
  phoneNumber: string
  total: number
  avg: number
  score: number
};

export interface AgentMetric {
  agentId: string
  agentName: string
  total: number
  avg: number
  score: number
}

export interface ClientMetric {
  clientId: string
  clientName: string
  totalMessages: number
  avgSentiment: number
  score: number
}

export interface ClientQuery {
  contactId: string
  username: string
  totalMessages: number
  avgPos: number
  totalPositive: number
  score: number
}
