import { Repository } from 'typeorm';
import { User } from '@stombie/retube-core';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    private readonly passwordHashSecret: string;    
    private readonly refreshTokenLifetime: string;
    private readonly accessTokenLifetime: string;

    constructor(configService: ConfigService,
                private readonly jwt: JwtService,
                @InjectRepository(User) private readonly users: Repository<User>) {
        this.passwordHashSecret = configService.get('auth.passwordHashSecret', 'passworf-hash-secret');
        this.refreshTokenLifetime = configService.get('auth.refreshTokenLifetime', '1d');
        this.accessTokenLifetime = configService.get('auth.accessTokenLifetime', '30m');
    }

    async register(email: string, password: string): Promise<User> {
        const existingUser = await this.users.findOneBy({
            email,
        });
        if (existingUser) {
            throw new Error(`User with email ${email} already exists`);
        }
        const newUser = this.users.create({
            email,
            passwordHash: this.hash(password),
        });
        await this.users.save(newUser);
        return newUser;
    }

    async login(email: string, password: string): Promise<OAuthTokens> {
        const user = await this.verifyUser(email, password);
        return this.generateTokens(user.id, user.email);
    }

    async refreshToken(token: string): Promise<OAuthTokens> {
        try {
            const { sub: id, email } = await this.jwt.verifyAsync(token);
            return this.generateTokens(id, email);
        } catch (err) {
            throw new Error(`Invalid refresh token ${token}`);
        }
    }

    async verifyUserByToken(token: string) {
        const { sub: id, email } = await this.jwt.verifyAsync(token);
        return this.verifyUser(email, id);
    }

    private async verifyUser(email: string, password: string) {
        const user = await this.users.findOneBy({
            email,
        });
        if (!user || user.passwordHash !== this.hash(password)) {
            throw new Error('User is not verified');
        }
        return user;
    }

    private async generateTokens(userId: string, email: string): Promise<OAuthTokens> {
        const payload = { sub: userId, email };
        const [refreshToken, accessToken] = await Promise.all([
            this.jwt.signAsync(payload, { expiresIn: this.refreshTokenLifetime }),
            this.jwt.sign(payload, { expiresIn: this.accessTokenLifetime })
        ]);

        return {
            refreshToken,
            accessToken,
        };
    }

    private hash(str: string) {
        return crypto.createHmac('sha256', this.passwordHashSecret)
            .update(str)
            .digest('hex');
    }
}