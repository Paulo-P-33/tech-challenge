import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './nest/app.module';
import { DomainExceptionFilter } from './nest/shared/domain-exception.filter';
import { ZodExceptionFilter } from './nest/shared/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new DomainExceptionFilter(), new ZodExceptionFilter());
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

void bootstrap();

