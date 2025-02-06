import { registerAs } from '@nestjs/config';

export const AuthConfig = registerAs('auth', () => ({
    passwordHashSecret: process.env.PASSWORD_HASH_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenLifetime: process.env.REFRESH_TOKEN_LIFETIME,
    accessTokenLifetime: process.env.ACCESS_TOKEN_LIFETIME,
}));
