import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUserDto } from '../../users/dto/authenticated-user.dto.js';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number;
  // exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserDto> {
    return { id: payload.sub, email: payload.email };
  }
}
