import { ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext): TUser {
    if (err || !user) {
      // Log presence of Authorization header for debugging (do not log token value)
      try {
        const request = context.switchToHttp().getRequest();
        const authHeader = request?.headers && (request.headers['authorization'] || request.headers['Authorization']);
        this.logger.warn(`Authentication failed. Authorization header present: ${!!authHeader}`);
      } catch (e) {
        this.logger.warn('Authentication failed and request could not be inspected.');
      }
      throw err || new UnauthorizedException('Invalid token or user not found.');
    }
    // For successful authentication, attach the user object to the request
    // This is what your @CurrentUser() decorator expects to find
    const request = context.switchToHttp().getRequest();
    request.user = user; // Assuming 'user' here is the deserialized JWT payload / user object
    return user;
  }
}
