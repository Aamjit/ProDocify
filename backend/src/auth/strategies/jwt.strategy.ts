import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUserDto } from '../../users/dto/authenticated-user.dto.js';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number;
  // exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'default-secret',
    });
    this.logger.debug('JwtStrategy initialized');
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserDto> {
    // Optionally log payload for debugging (avoid logging sensitive data in production)
    this.logger.debug(`Validating JWT for user ${payload.sub}`);
    return { id: payload.sub, email: payload.email };
  }
}
