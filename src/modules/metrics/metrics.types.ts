export type Table = 'chats' | 'messages' | 'users' | 'contacts' | 'transfers';

export type Metric = 'chats' | 'messages' | 'agents' | 'clients';
export type CompareMetric = 'chat' | 'message' | 'agent' | 'transfer' | 'client';

export type TopType = 'agents' | 'clients';

export type SentimentType = 'POS' | 'NEU' | 'NEG';
export type SentimentActor = 'agent' | 'client';