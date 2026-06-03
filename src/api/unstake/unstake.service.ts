import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_SERVICE } from '@common/database/database.interface';
import type { IDatabaseService } from '@common/database/database.interface';
import type { PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class UnstakeService {
  constructor(@Inject(DATABASE_SERVICE) private readonly db: IDatabaseService) {}

  getUnstakeEvents(chain: string, dto: PaginationDto) {
    return this.db.getUnstakeEvents(chain, dto);
  }
}
