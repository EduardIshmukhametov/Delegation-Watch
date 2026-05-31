import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { AdaptersModule } from './adapters/adapters.module';
import { DatabaseModule } from '@common/database/database.module';

@Module({
  imports: [AdaptersModule, DatabaseModule],
  providers: [IndexerService],
})
export class IndexerModule {}
