import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'config/.env.dev', // шлях до файлу
      isGlobal: true,                 // робить доступним у всьому проекті
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        schema: configService.get<string>('DB_SCHEMA'),
        autoLoadEntities: true,
        //logging: ['query', 'error', 'warn'], // Логує всі запити, помилки та попередження
        logger: 'advanced-console', // Використовує розширений консольний логер для кращого форматування
        //maxQueryExecutionTime: 1000, // Логує запити > 1000ms
        logging: true, // Включає логування усіх SQL запитів
      }),
    }),
  ],
})
export class DatabaseModule { }