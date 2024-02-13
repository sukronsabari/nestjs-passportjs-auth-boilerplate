import helmet from 'helmet';
import * as morgan from 'morgan';
import * as compression from 'compression';
// import * as session from 'express-session';
// import * as passport from 'passport';
import { NestFactory } from '@nestjs/core';
// import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  // const configService = app.get(ConfigService);

  // app.use(csurf());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ errorHttpStatusCode: 422 }));
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(3000);
}
bootstrap();
