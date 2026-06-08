import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedUserDto } from '../users/dto/authenticated-user.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { GoogleOAuthGuard } from './guards/google-oauth.guard.js';
import { Public } from '@prisma/client/runtime/index-browser';

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

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  googleLogin() {
    // return 'Redirecting to Google OAuth2...';
    // This endpoint will redirect the user to the Google OAuth2 authorization URL
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  async logout(
    @Request() req: ExpressRequest & { user: AuthenticatedUserDto },
  ): Promise<void> {
    await this.authService.logout(req.user.id);
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  @ApiResponse({
    status: 200,
    description: 'Handles the Google OAuth2 callback and returns an app JWT access token for the authenticated user.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOi...',
        user: {
          id: 'user-id',
          email: 'user@example.com',
        },
      },
    },
  })
  async googleCallback(
    @Request() req: any,
    @Res() res: any,
  ): Promise<void> {
    const googleUser = await this.authService.loginOAuth(req.user);
    res.redirect(`${process.env.FRONTEND_URL}?accessToken=${googleUser.accessToken}`);
  }
}
