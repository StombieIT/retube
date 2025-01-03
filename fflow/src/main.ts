import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка парсинга Body как буффера
  app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '10mb' }));
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
