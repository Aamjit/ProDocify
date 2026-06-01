import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { AuthenticatedUserDto } from '../users/dto/authenticated-user.dto.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './strategies/jwt.strategy.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: AuthenticatedUserDto }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      // exp: Math.floor(Date.now() / 1000) + 3600
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '2h' }),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}
