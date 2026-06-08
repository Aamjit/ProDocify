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

    // Only EMAIL auth type users can login with password
    if ((user as any).accountAuthType !== 'EMAIL') {
      throw new UnauthorizedException('This account uses a different authentication method');
    }

    if (!user.password) {
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

  async loginOAuth(user: { id: string; email: string; name?: string }): Promise<{ accessToken: string; user: AuthenticatedUserDto }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
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

  async logout(userId: string): Promise<void> {
    // With stateless JWT authentication, logout is handled by the client
    // discarding the access token. Add token revocation or refresh token
    // invalidation here if the app later uses a persistent session store.
    return;
  }

  async validateGoogleLogin(profile: any): Promise<any> {
    const email = profile.emails?.[0]?.value || profile.email;
    if (!email) {
      throw new UnauthorizedException('No email found in OAuth profile');
    }

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      // Create new user with GOOGLE_OAUTH auth type
      user = await this.usersService.create({
        email,
        name: profile.displayName || profile.name,
        accountAuthType: 'GOOGLE_OAUTH',
        avatarUrl: profile.photos?.[0]?.value || null,
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    };
  }
}
