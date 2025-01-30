import { registerAs } from '@nestjs/config';

export const FtpConfig = registerAs('ftp', () => ({
    serverHost: process.env.FTP_SERVER_HOST,
    serverPort: parseInt(process.env.FTP_SERVER_PORT, 10),
    connectionsLimit: parseInt(process.env.FTP_CONNECTIONS_LIMIT, 10),
}));
