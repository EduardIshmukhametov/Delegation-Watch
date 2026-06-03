import { Controller, Get, Param, Query } from '@nestjs/common';
import { UnstakeService } from './unstake.service';
import { PaginationDto } from '@common/dto/pagination.dto';

@Controller(':chain/unstake')
export class UnstakeController {
  constructor(private readonly unstakeService: UnstakeService) {}

  @Get()
  getAll(@Param('chain') chain: string, @Query() query: PaginationDto) {
    return this.unstakeService.getUnstakeEvents(chain, query);
  }
}
