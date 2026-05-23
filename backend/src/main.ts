import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UserDto } from './users/dto/user.dto';
import { RegisterDto } from './users/dto/register.dto';
import { LoginDto } from './auth/dto/login.dto';
import { CreateDocumentDto } from './documents/dto/create-document.dto';
import { UpdateDocumentDto } from './documents/dto/update-document.dto';
import { CreateFolderDto } from './folders/dto/create-folder.dto';
import { AppModule } from './app.module';
import { winstonLogger } from './common/logger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: winstonLogger
    });

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const swaggerConfig = new DocumentBuilder()
        .setTitle('ProDocify API')
        .setDescription('ProDocify backend API documentation')
        .setVersion('1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
            'JWT-auth'
        )
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        extraModels: [UserDto, RegisterDto, LoginDto, CreateDocumentDto, UpdateDocumentDto, CreateFolderDto]
    });
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 4000;
    await app.listen(port, () => {
        winstonLogger.log('info', `ProDocify backend listening on http://localhost:${port}/api`);
        winstonLogger.log('info', `Swagger docs available at http://localhost:${port}/api/docs`);
    });
}

bootstrap();
