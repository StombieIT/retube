import { registerAs } from '@nestjs/config';

export const HolderConfig = registerAs('holder', () => ({
    'baseUrl': process.env.HOLDER_BASE_URL,
    'manifestName': process.env.manifestName,
}));
