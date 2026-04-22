import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './nest/app.module';
import { DomainExceptionFilter } from './nest/shared/domain-exception.filter';
import { ZodExceptionFilter } from './nest/shared/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new DomainExceptionFilter(), new ZodExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Tech Challenge API')
    .setDescription('API de gerenciamento de produtos, categorias e favoritos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

void bootstrap();
