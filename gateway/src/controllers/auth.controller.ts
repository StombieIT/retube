import { AuthService } from '@/services/auth.service';
import { Gateway } from '@stombie/retube-core';
import { Body, Controller, HttpException, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {
    }

    @Post('register')
    async register(@Body() { email, password }: Gateway.Request.Register): Promise<Gateway.Response.Register> {
        try {
            await this.auth.register(email, password);
            return {
                status: 'success',
                message: 'Successfully registered user',
            };
        } catch (err) {
            throw new HttpException({
                status: 'error',
                messsage: 'User has already registered',
            }, 400);
        }
    }

    @Post('login')
    async login(@Body() { email, password }: Gateway.Request.Login): Promise<Gateway.Response.Login> {
        try {
            const tokens = await this.auth.login(email, password);
            return {
                status: 'success',
                message: 'Successfully logged in',
                payload: tokens,
            };
        } catch (err) {
            throw new HttpException({
                status: 'error',
                message: 'Credentials are invalid',
            }, 400);
        }
    }

    @Post('refresh')
    async refresh(@Body() { refreshToken }: Gateway.Request.Refresh) {
        try {
            const tokens = await this.auth.refreshToken(refreshToken);
            return {
                status: 'success',
                message: 'Successfully refreshed',
                payload: tokens,
            };
        } catch (err) {
            throw new HttpException({
                status: 'error',
                message: 'Token is invalid',
            }, 400);
        }
    }
}