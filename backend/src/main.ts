import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { winstonLogger } from './common/logger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: winstonLogger
    });

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const port = process.env.PORT || 4000;
    await app.listen(port, () => {
        winstonLogger.log('info', `ProDocify backend listening on http://localhost:${port}/api`);
    });
}

bootstrap();
