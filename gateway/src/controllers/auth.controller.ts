import { AuthGuard } from '@/services/auth.guard';
import { AuthService } from '@/services/auth.service';
import { Body, Controller, Get, HttpException, Post, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {
    }

    @Post('register')
    async register(@Body() { email, password }: { email: string, password: string }) {
        try {
            await this.auth.register(email, password);
            return this.auth.login(email, password);
        } catch (err) {
            throw new HttpException('Bred', 500);
        }
    }


    @Get('protected')
    @UseGuards(AuthGuard)
    mockProtected() {
        return { result: 'good' };
    }
}