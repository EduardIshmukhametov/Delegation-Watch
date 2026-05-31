import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { CHAIN_ADAPTER } from './adapters/adapter.interface';
import type { IChainAdapter } from './adapters/adapter.interface';
import { DATABASE_SERVICE } from '@common/database/database.interface';
import type { IDatabaseService } from '@common/database/database.interface';
import type { StakeEvent, UnstakeEvent } from '@common/types';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private readonly firstBlock: number;

  constructor(
    @Inject(CHAIN_ADAPTER) private readonly adapter: IChainAdapter,
    @Inject(DATABASE_SERVICE) private readonly db: IDatabaseService,
    config: ConfigService,
  ) {
    this.firstBlock = config.get<number>('FIRST_BLOCK', 1);
  }

  async onModuleInit() {
    await this.index();
  }

  @Interval('indexer', 30_000)
  async index() {
    const chain = this.adapter.chainName;
    try {
      const latestBlock = await this.adapter.getLatestBlock();
      const lastIndexed = await this.db.getLastIndexedBlock(chain);
      const fromBlock = lastIndexed !== null ? lastIndexed + 1 : this.firstBlock;

      if (fromBlock > latestBlock) {
        this.logger.debug(`[${chain}] up to date at block ${latestBlock}`);
        return;
      }

      for (let cursor = fromBlock; cursor <= latestBlock; cursor += this.adapter.blockRange) {
        const toBlock = Math.min(cursor + this.adapter.blockRange - 1, latestBlock);
        await this.processRange(cursor, toBlock);
      }

      await this.db.saveLastIndexedBlock(chain, latestBlock);
      this.logger.log(`[${chain}] indexed up to block ${latestBlock}`);
    } catch (err) {
      this.logger.error(`[${chain}] ${(err as Error).message}`);
    }
  }

  private async processRange(fromBlock: number, toBlock: number) {
    const logs = await this.adapter.fetchLogs(fromBlock, toBlock);
    if (!logs.length) return;

    await this.db.saveLogs(this.adapter.chainName, logs);

    const stakes: StakeEvent[] = [];
    const unstakes: UnstakeEvent[] = [];

    for (const log of logs) {
      const parsed = this.adapter.parseLog(log);
      if (!parsed) continue;

      const event = { chain: this.adapter.chainName, blockNumber: log.blockNumber, transactionHash: log.transactionHash, wallet: parsed.wallet, amount: parsed.amount, timestamp: log.timestamp };
      parsed.type === 'stake' ? stakes.push(event) : unstakes.push(event);
    }

    await this.db.saveStakeEvents(this.adapter.chainName, stakes);
    await this.db.saveUnstakeEvents(this.adapter.chainName, unstakes);

    this.logger.debug(`[${this.adapter.chainName}] ${fromBlock}–${toBlock}: ${logs.length} logs, ${stakes.length} stakes, ${unstakes.length} unstakes`);
  }
}
