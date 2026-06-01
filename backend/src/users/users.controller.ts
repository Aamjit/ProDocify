import { Body, Controller, Get, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { winstonLogger } from '../common/logger.js';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UserDto } from './dto/user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, type: UserDto })
  async register(@Body() registerDto: RegisterDto): Promise<UserDto> {
    winstonLogger.log('info', `Registering new user with email: ${registerDto.email}`);
    const user = await this.usersService.create(registerDto);
    return {
      id: user.id,
      email: user.email,
      password: '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get profile of currently logged-in user' })
  @ApiResponse({ status: 200, type: UserDto })
  async getProfile(@CurrentUser() user: AuthenticatedUserDto): Promise<UserDto> {
    winstonLogger.log('info', `Fetching profile for user with ID: ${user.id}`);
    const userData = await this.usersService.findById(user.id);
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    return {
      id: userData.id,
      email: userData.email,
      password: '',
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  }
}
