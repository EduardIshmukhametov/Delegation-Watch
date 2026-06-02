import { Module } from '@nestjs/common';
import { MysqlService } from './mysql/mysql.service';
import { DATABASE_SERVICE } from './database.interface';

@Module({
  providers: [{ provide: DATABASE_SERVICE, useClass: MysqlService }],
  exports: [DATABASE_SERVICE],
})
export class DatabaseModule {}
