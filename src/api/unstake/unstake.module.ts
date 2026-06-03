import { Module } from '@nestjs/common';
import { UnstakeController } from './unstake.controller';
import { UnstakeService } from './unstake.service';

@Module({
  controllers: [UnstakeController],
  providers: [UnstakeService],
})
export class UnstakeModule {}
