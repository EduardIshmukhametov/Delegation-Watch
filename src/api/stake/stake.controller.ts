import { Controller, Get, Param, Query } from '@nestjs/common';
import { StakeService } from './stake.service';
import { PaginationDto } from '@common/dto/pagination.dto';

@Controller(':chain/stake')
export class StakeController {
  constructor(private readonly stakeService: StakeService) {}

  @Get()
  getAll(@Param('chain') chain: string, @Query() query: PaginationDto) {
    return this.stakeService.getStakeEvents(chain, query);
  }
}
