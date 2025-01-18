import { registerAs } from '@nestjs/config';

export const FtpConfig = registerAs('ftp', () => ({
    url: process.env.FTP_URL,
}));
