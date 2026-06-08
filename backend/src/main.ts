// IMPORTANT: Make sure to import `instrument.ts` at the top of your file.
// If you're using CommonJS (CJS) syntax, use `require("./instrument.ts");`
import './instrument.js';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { LoginDto } from './auth/dto/login.dto.js';
import { winstonLogger } from './common/logger.js';
import { CreateDocumentDto } from './documents/dto/create-document.dto.js';
import { UpdateDocumentDto } from './documents/dto/update-document.dto.js';
import { CreateFolderDto } from './folders/dto/create-folder.dto.js';
import { RegisterDto } from './users/dto/register.dto.js';
import { UserDto } from './users/dto/user.dto.js';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(passport.initialize());
  app.use(passport.session());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ProDocify API')
    .setDescription('ProDocify backend API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [
      UserDto,
      RegisterDto,
      LoginDto,
      CreateDocumentDto,
      UpdateDocumentDto,
      CreateFolderDto,
    ],
  });
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, () => {
    winstonLogger.log('info', `ProDocify backend listening on http://localhost:${port}/api`);
    winstonLogger.log('info', `Swagger docs available at http://localhost:${port}/api/docs`);
  });
}

bootstrap();
