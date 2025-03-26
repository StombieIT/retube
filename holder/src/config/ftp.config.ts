import { registerAs } from '@nestjs/config';

export const FtpConfig = registerAs('ftp', () => ({
    url: process.env.FTP_URL,
    pasvMinPort: parseInt(process.env.FTP_PASV_MIN_PORT, 10),
    pasvMaxPort: parseInt(process.env.FTP_PASV_MAX_PORT, 10),
}));
