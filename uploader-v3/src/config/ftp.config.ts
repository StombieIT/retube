import { registerAs } from '@nestjs/config';

export const FtpConfig = registerAs('ftp', () => ({
    holderUrl: process.env.FTP_HOLDER_URL,
}));
