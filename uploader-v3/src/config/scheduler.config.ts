import { registerAs } from '@nestjs/config';

export const SchedulerConfig = registerAs('scheduler', () => ({
    enabled: process.env.SCHEDULER_ENABLED === 'true',
    sleepTime: parseInt(process.env.SCHEDULER_SLEEP_TIME, 10) || 60 * 1000,
    uploadingLifetimeMaximum: parseInt(process.env.SCHEDULER_LIFETIME_MAXIMUM, 10) || 10 * 60 * 1000,
}));
