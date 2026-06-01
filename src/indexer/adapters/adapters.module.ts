import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MonadAdapter } from './monad/monad.adapter';
import { CHAIN_ADAPTER } from './adapter.interface';
import type { IChainAdapter } from './adapter.interface';

@Module({
  providers: [
    MonadAdapter,
    {
      provide: CHAIN_ADAPTER,
      useFactory: (config: ConfigService, monad: MonadAdapter): IChainAdapter => {
        const chain = config.getOrThrow<string>('CHAIN');
        const registry: Record<string, IChainAdapter> = { monad };
        if (!registry[chain]) throw new Error(`Unknown chain "${chain}". Available: ${Object.keys(registry).join(', ')}`);
        return registry[chain];
      },
      inject: [ConfigService, MonadAdapter],
    },
  ],
  exports: [CHAIN_ADAPTER],
})
export class AdaptersModule {}
