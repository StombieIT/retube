import { registerAs } from '@nestjs/config';

export const AppConfig = registerAs('app', () => ({
    rootPath: process.env.ROOT_PATH,
}));
