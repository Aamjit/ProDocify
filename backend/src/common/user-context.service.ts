import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedUserDto } from '../users/dto/authenticated-user.dto.js';

@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) { }

  /**
   * Get the current authenticated user from the request
   * This is automatically injected by NestJS REQUEST provider
   */
  getCurrentUser(): AuthenticatedUserDto {
    return (this.request as any).user as AuthenticatedUserDto;
  }

  /**
   * Get the current user's ID
   */
  getCurrentUserId(): string {
    return this.getCurrentUser().id;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}
