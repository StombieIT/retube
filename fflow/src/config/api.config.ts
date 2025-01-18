import { registerAs } from '@nestjs/config';

export const ApiConfig = registerAs('api', () => ({
    holderUploadUrl: process.env.HOLDER_UPLOAD_URL,
}));
