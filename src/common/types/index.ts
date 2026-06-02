export interface RawLog {
  chain: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  address: string;
  topics: string[];
  data: string;
  timestamp: number;
}

export interface StakeEvent {
  chain: string;
  blockNumber: number;
  transactionHash: string;
  wallet: string;
  amount: string;
  timestamp: number;
}

export interface UnstakeEvent {
  chain: string;
  blockNumber: number;
  transactionHash: string;
  wallet: string;
  amount: string;
  timestamp: number;
}

export interface ParsedStakingEvent {
  type: 'stake' | 'unstake';
  wallet: string;
  amount: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
