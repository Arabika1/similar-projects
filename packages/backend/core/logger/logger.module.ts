import { LoggerModule } from 'nestjs-pino';

const configuration = {
  pinoHttp: {
    level: 'debug',
  },
};

export default LoggerModule.forRoot(configuration);
