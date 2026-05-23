import { Body, Controller, Get, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, type: UserDto })
    async register(@Body() registerDto: RegisterDto): Promise<UserDto> {
        const user = await this.usersService.create(registerDto);
        return {
            id: user.id,
            email: user.email,
            password: '',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get profile of currently logged-in user' })
    @ApiResponse({ status: 200, type: UserDto })
    @Get('profile')
    async getProfile(@CurrentUser() user: any): Promise<UserDto> {
        const userData = await this.usersService.findById(user.userId);
        if (!userData) {
            throw new NotFoundException('User not found');
        }
        return {
            id: userData.id,
            email: userData.email,
            password: '',
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
        };
    }
}
