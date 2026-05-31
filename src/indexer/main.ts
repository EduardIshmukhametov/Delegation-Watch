import { NestFactory } from '@nestjs/core';
import { IndexerAppModule } from './app.module';

async function bootstrap() {
  if (process.argv[2]) process.env.CHAIN = process.argv[2];
  await NestFactory.createApplicationContext(IndexerAppModule);
}
bootstrap();
