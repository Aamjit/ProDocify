import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PrismaUserContextInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request?.user?.id;
    return this.prisma.runWithUser(userId, () => next.handle());
  }
}
