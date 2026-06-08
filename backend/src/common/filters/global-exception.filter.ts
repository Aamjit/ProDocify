import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { winstonLogger } from '../logger.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = winstonLogger;

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = this.getExceptionMessage(exception);
        const responseBody = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request?.url ?? httpAdapter.getRequestUrl(ctx.getRequest()),
            message,
        };

        if (!(exception instanceof HttpException)) {
            this.logger.error('Unhandled exception caught by GlobalExceptionFilter', {
                exception,
                message: (exception as Error)?.message,
                stack: (exception as Error)?.stack,
            });
        } else if (status >= 500) {
            this.logger.error('HttpException caught by GlobalExceptionFilter', {
                status,
                response: exception.getResponse(),
            });
        } else {
            this.logger.warn('HttpException thrown', {
                status,
                response: exception.getResponse(),
            });
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, status);
    }

    private getExceptionMessage(exception: unknown): string {
        if (exception instanceof HttpException) {
            const response = exception.getResponse();

            if (typeof response === 'string') {
                return response;
            }

            if (typeof response === 'object' && response !== null) {
                const responseObject = response as Record<string, unknown>;
                const message = responseObject.message;

                if (Array.isArray(message)) {
                    return message.join(', ');
                }

                if (typeof message === 'string') {
                    return message;
                }
            }

            return exception.message;
        }

        return 'Internal server error';
    }
}
