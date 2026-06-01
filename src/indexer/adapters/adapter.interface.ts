import type { ParsedStakingEvent, RawLog } from '@common/types';

export interface IChainAdapter {
  readonly chainName: string;
  readonly blockRange: number;
  getLatestBlock(): Promise<number>;
  fetchLogs(fromBlock: number, toBlock: number): Promise<RawLog[]>;
  parseLog(log: RawLog): ParsedStakingEvent | null;
}

export const CHAIN_ADAPTER = Symbol('CHAIN_ADAPTER');
