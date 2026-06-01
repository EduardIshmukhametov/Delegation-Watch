import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http, parseAbiItem, decodeEventLog, type PublicClient, type Log } from 'viem';
import type { IChainAdapter } from '../adapter.interface';
import type { ParsedStakingEvent, RawLog } from '@common/types';

const STAKING_ABI = [
  parseAbiItem('event Staked(address indexed wallet, uint256 amount)'),
  parseAbiItem('event Unstaked(address indexed wallet, uint256 amount)'),
] as const;

@Injectable()
export class MonadAdapter implements IChainAdapter {
  readonly chainName = 'monad';
  readonly blockRange: number;

  private readonly logger = new Logger(MonadAdapter.name);
  private readonly client: PublicClient;
  private readonly stakingContract: `0x${string}`;

  constructor(config: ConfigService) {
    this.stakingContract = config.getOrThrow<string>('MONAD_STAKING_CONTRACT') as `0x${string}`;
    this.blockRange = config.get<number>('MONAD_BLOCK_RANGE', 1000);
    this.client = createPublicClient({ transport: http(config.getOrThrow<string>('MONAD_RPC_URL')) });
  }

  async getLatestBlock() {
    return Number(await this.client.getBlockNumber());
  }

  async fetchLogs(fromBlock: number, toBlock: number): Promise<RawLog[]> {
    this.logger.debug(`fetching ${fromBlock}–${toBlock}`);

    const logs: Log[] = await this.client.getLogs({
      address: this.stakingContract,
      fromBlock: BigInt(fromBlock),
      toBlock: BigInt(toBlock),
    });

    return Promise.all(
      logs.map(async (log) => {
        const block = await this.client.getBlock({ blockNumber: log.blockNumber! });
        return {
          chain: this.chainName,
          blockNumber: Number(log.blockNumber),
          transactionHash: log.transactionHash!,
          logIndex: log.logIndex!,
          address: log.address,
          topics: log.topics as string[],
          data: log.data,
          timestamp: Number(block.timestamp),
        };
      }),
    );
  }

  parseLog(log: RawLog): ParsedStakingEvent | null {
    try {
      const decoded = decodeEventLog({
        abi: STAKING_ABI,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        data: log.data as `0x${string}`,
      });

      const args = decoded.args as any;
      if (decoded.eventName === 'Staked') return { type: 'stake', wallet: args.wallet, amount: String(args.amount) };
      if (decoded.eventName === 'Unstaked') return { type: 'unstake', wallet: args.wallet, amount: String(args.amount) };
    } catch {}

    return null;
  }
}
