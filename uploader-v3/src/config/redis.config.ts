import { registerAs } from '@nestjs/config';

export const RedisConfig = registerAs('redis', () => ({
    connectionString: process.env.REDIS_CONNECTION_STRING,
    fflowCacheDB: parseInt(process.env.FFLOW_CACHE_DB, 10),
}));
