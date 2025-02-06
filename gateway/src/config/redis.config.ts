import { registerAs } from '@nestjs/config';

export const RedisConfig = registerAs('redis', () => ({
    connectionString: process.env.REDIS_CONNECTION_STRING,
    videoCacheDB: parseInt(process.env.VIDEO_CACHE_DB, 10)
}));
