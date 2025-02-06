import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard extends PassportAuthGuard('local') {
    constructor(private readonly auth: AuthService) {
        super();
    }    

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // TODO: исправить
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['Authorization'] as Maybe<string>;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authorization token required');
        }
        const [, token] = authHeader.split(' ');
        try {
            const user = await this.auth.verifyUserByToken(token);
            // @ts-ignore
            request.user = user;
            return Boolean(user);
        } catch (err) {
            throw new UnauthorizedException(err);
        }
    }
}