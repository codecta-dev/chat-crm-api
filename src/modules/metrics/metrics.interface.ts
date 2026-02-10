import { Contact } from "@modules/contacts/entities/contact.entity"
import { User } from "@modules/users/entities/user.entity"

export interface TrendPeriodQuery {
  date: string,
  avgPos: number,
  avgNeu: number,
  avgNeg: number,
}

export interface AgentQuery {
  id: string
  firstName: string
  lastName: string
  username: string
  profile: string
  phone: string
  avgPos: number
  avgNeu: number
  avgNeg: number
  total: number
};

type SentimentUser = Pick<User, 'id' | 'username'>;
type SentimentContact = Pick<Contact, 'id' | 'username'>;

export interface SentimentTopQuery extends SentimentUser {
  total: number,
  label: string,
  avgPos: number,
  avgNeu: number,
  avgNeg: number,
}

export interface SentimentTop {
  onwer: SentimentUser | SentimentContact,
  agent?: SentimentUser,
  contact?: SentimentContact,
  label: string,
  sentiment: {
    pos: number,
    neu: number,
    neg: number,
  }
  total: number,
}

export interface ContactQuery {
  id: string
  username: string
  firstNames: string
  lastNames: string
  phoneNumber: string
  profile?: string
  count: number
}

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
