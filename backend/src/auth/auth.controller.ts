import { Body, Controller, Post, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 201, description: 'Returns JWT access token', schema: { example: { access_token: 'eyJhbGciOi...' } } })
    @Post('login')
    @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'User logout' })
    @Post('logout')
    async logout(@Request() req: any) {
        return { message: 'Logged out successfully', userId: req.user.userId };
    }
}
