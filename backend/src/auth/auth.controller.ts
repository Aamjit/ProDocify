import { Body, Controller, Post } from '@nestjs/common';

class LoginDto {
    email!: string;
    password!: string;
}

@Controller('auth')
export class AuthController {
    @Post('login')
    login(@Body() body: LoginDto) {
        return {
            message: 'This is a placeholder auth endpoint',
            email: body.email
        };
    }
}
