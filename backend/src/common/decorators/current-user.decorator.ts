import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserDto } from '../../users/dto/authenticated-user.dto.js';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as AuthenticatedUserDto; // Assuming the user object is of type AuthenticatedUserDto
});
