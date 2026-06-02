import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';
import type { IDatabaseService, QueryOptions } from '../database.interface';
import type { PaginatedResult, RawLog, StakeEvent, UnstakeEvent } from '@common/types';

type StakingEvent = StakeEvent | UnstakeEvent;

@Injectable()
export class MysqlService implements IDatabaseService, OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: this.config.get('DB_HOST', 'localhost'),
      port: this.config.get<number>('DB_PORT', 3306),
      user: this.config.get('DB_USER', 'root'),
      password: this.config.get('DB_PASSWORD', ''),
      database: this.config.get('DB_NAME', 'delegation_watch'),
      connectionLimit: 10,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async saveLogs(chain: string, logs: RawLog[]) {
    if (!logs.length) return;
    const rows = logs.map((l) => [chain, l.blockNumber, l.transactionHash, l.logIndex, l.address, JSON.stringify(l.topics), l.data, l.timestamp]);
    await this.pool.query(
      'INSERT IGNORE INTO raw_logs (chain, block_number, transaction_hash, log_index, address, topics, data, timestamp) VALUES ?',
      [rows],
    );
  }

  async saveStakeEvents(chain: string, events: StakeEvent[]) {
    await this.insertEvents('stake_events', chain, events);
  }

  async saveUnstakeEvents(chain: string, events: UnstakeEvent[]) {
    await this.insertEvents('unstake_events', chain, events);
  }

  private async insertEvents(table: string, chain: string, events: StakingEvent[]) {
    if (!events.length) return;
    const rows = events.map((e) => [chain, e.blockNumber, e.transactionHash, e.wallet, e.amount, e.timestamp]);
    await this.pool.query(
      `INSERT IGNORE INTO ${table} (chain, block_number, transaction_hash, wallet, amount, timestamp) VALUES ?`,
      [rows],
    );
  }

  async getLogs(chain: string, opts: QueryOptions): Promise<PaginatedResult<RawLog>> {
    return this.paginate('raw_logs', chain, opts, (row) => ({
      chain: row.chain,
      blockNumber: row.block_number,
      transactionHash: row.transaction_hash,
      logIndex: row.log_index,
      address: row.address,
      topics: JSON.parse(row.topics),
      data: row.data,
      timestamp: row.timestamp,
    }));
  }

  async getStakeEvents(chain: string, opts: QueryOptions): Promise<PaginatedResult<StakeEvent>> {
    return this.paginate('stake_events', chain, opts, this.mapStakingRow);
  }

  async getUnstakeEvents(chain: string, opts: QueryOptions): Promise<PaginatedResult<UnstakeEvent>> {
    return this.paginate('unstake_events', chain, opts, this.mapStakingRow);
  }

  private mapStakingRow = (row: any) => ({
    chain: row.chain,
    blockNumber: row.block_number,
    transactionHash: row.transaction_hash,
    wallet: row.wallet,
    amount: row.amount,
    timestamp: row.timestamp,
  });

  private async paginate<T>(table: string, chain: string, opts: QueryOptions, mapper: (row: any) => T): Promise<PaginatedResult<T>> {
    const { page, limit, wallet } = opts;
    const offset = (page - 1) * limit;

    const where = wallet ? 'chain = ? AND wallet = ?' : 'chain = ?';
    const params = wallet ? [chain, wallet] : [chain];

    const [[{ total }]] = await this.pool.query<any[]>(`SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`, params);
    const [rows] = await this.pool.query<any[]>(`SELECT * FROM ${table} WHERE ${where} ORDER BY block_number ASC LIMIT ? OFFSET ?`, [...params, limit, offset]);

    return { data: (rows as any[]).map(mapper), total, page, limit };
  }

  async getLastIndexedBlock(chain: string) {
    const [[row]] = await this.pool.query<any[]>('SELECT last_indexed_block FROM indexer_state WHERE chain = ?', [chain]);
    return row ? Number(row.last_indexed_block) : null;
  }

  async saveLastIndexedBlock(chain: string, block: number) {
    await this.pool.query(
      'INSERT INTO indexer_state (chain, last_indexed_block) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_indexed_block = VALUES(last_indexed_block)',
      [chain, block],
    );
  }
}
