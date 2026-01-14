import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', 'config', `.env.${process.env.NODE_ENV || 'local'}`),
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
