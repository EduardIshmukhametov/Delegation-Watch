import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_SERVICE } from '@common/database/database.interface';
import type { IDatabaseService } from '@common/database/database.interface';
import type { PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class LogsService {
  constructor(@Inject(DATABASE_SERVICE) private readonly db: IDatabaseService) {}

  getLogs(chain: string, dto: PaginationDto) {
    return this.db.getLogs(chain, dto);
  }
}
