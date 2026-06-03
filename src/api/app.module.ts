import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@common/database/database.module';
import { LogsModule } from './logs/logs.module';
import { StakeModule } from './stake/stake.module';
import { UnstakeModule } from './unstake/unstake.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LogsModule,
    StakeModule,
    UnstakeModule,
  ],
})
export class ApiAppModule {}
