import { Controller, Get, Param, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { PaginationDto } from '@common/dto/pagination.dto';

@Controller(':chain/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  getAll(@Param('chain') chain: string, @Query() query: PaginationDto) {
    return this.logsService.getLogs(chain, query);
  }
}
