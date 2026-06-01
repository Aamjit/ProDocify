import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcome(): Record<string, string> {
    return {
      message: 'Welcome to ProDocify backend',
      status: 'ok',
    };
  }
}
