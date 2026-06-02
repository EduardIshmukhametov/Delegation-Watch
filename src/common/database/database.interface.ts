import type { PaginatedResult, RawLog, StakeEvent, UnstakeEvent } from '@common/types';

export interface QueryOptions {
  page: number;
  limit: number;
  wallet?: string;
}

export interface IDatabaseService {
  saveLogs(chain: string, logs: RawLog[]): Promise<void>;
  saveStakeEvents(chain: string, events: StakeEvent[]): Promise<void>;
  saveUnstakeEvents(chain: string, events: UnstakeEvent[]): Promise<void>;

  getLogs(chain: string, options: QueryOptions): Promise<PaginatedResult<RawLog>>;
  getStakeEvents(chain: string, options: QueryOptions): Promise<PaginatedResult<StakeEvent>>;
  getUnstakeEvents(chain: string, options: QueryOptions): Promise<PaginatedResult<UnstakeEvent>>;

  getLastIndexedBlock(chain: string): Promise<number | null>;
  saveLastIndexedBlock(chain: string, block: number): Promise<void>;
}

export const DATABASE_SERVICE = Symbol('DATABASE_SERVICE');
