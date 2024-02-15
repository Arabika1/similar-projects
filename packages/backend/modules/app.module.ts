import { Module } from '@nestjs/common';
import { SearchModule } from './search/search.module';
import { ConfigModule } from '@nestjs/config';
import loggerModule from 'core/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    loggerModule,
    SearchModule,
  ],
})
export class AppModule {}
