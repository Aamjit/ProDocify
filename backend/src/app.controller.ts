import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get('hello')
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Server is healthy', schema: { example: { message: 'Welcome to ProDocify backend', status: 'ok' } } })
    getRoot() {
        return this.appService.getWelcome();
    }
}
