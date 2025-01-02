import { registerAs } from '@nestjs/config';

export const ApiConfig = registerAs('api', () => ({
    fflowUrl: process.env.FFLOW_URL
}));