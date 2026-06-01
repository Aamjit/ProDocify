import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedUserDto } from '../users/dto/authenticated-user.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Returns JWT access token',
    schema: { example: { access_token: 'eyJhbGciOi...' } },
  })
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: AuthenticatedUserDto }> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  async logout(
    @Request() req: ExpressRequest & { user: AuthenticatedUserDto },
  ): Promise<{ message: string; userId: string }> {
    return { message: 'Logged out successfully', userId: req.user.id };
  }
}
