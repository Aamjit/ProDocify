import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service.js';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.OAUTH2_CLIENTID ?? '',
            clientSecret: process.env.OAUTH2_CLIENTSECRET ?? '',
            callbackURL: process.env.OAUTH2_CALLBACKURI ?? '',
            scope: ['profile', 'email']
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const user = await this.authService.validateGoogleLogin(profile);

        done(null, user);
    }
}