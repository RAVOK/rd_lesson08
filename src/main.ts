import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation for GraphQL inputs (class-validator + DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const configService = app.get(ConfigService); // отримуємо доступ до ConfigService
  const port = configService.get<number>('PORT') ?? 7000; // читаємо порт із конфігурації

  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();