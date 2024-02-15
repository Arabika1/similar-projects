import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(cors());
  const logger = app.get<Logger>(Logger);
  const configService = app.get(ConfigService);

  const appPort = configService.get<number>('BACKEND_APP_PORT', 80);

  app.useLogger(logger);

  await app.listen(appPort, () =>
    logger.warn(`Application listening on port: ${appPort}`),
  );
}

(async () => bootstrap())();
