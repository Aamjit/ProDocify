import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext): TUser {
    if (err || !user) {
      // If authentication fails, throw an error
      // You might want to customize this error handling
      throw err || new UnauthorizedException('Invalid token or user not found.');
    }
    // For successful authentication, attach the user object to the request
    // This is what your @CurrentUser() decorator expects to find
    const request = context.switchToHttp().getRequest();
    request.user = user; // Assuming 'user' here is the deserialized JWT payload / user object
    return user;
  }
}
