import { registerAs } from '@nestjs/config';

export const AppConfig = registerAs('app', () => ({
    globalPrefix: process.env.GLOBAL_PREFIX,
    host: process.env.HOST,
}));
