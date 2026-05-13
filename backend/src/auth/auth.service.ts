import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    validateUser(email: string, password: string) {
        return { email, valid: false };
    }
}
