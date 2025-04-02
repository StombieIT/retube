import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FtpSession } from '../libs/ftp-session';

@Injectable()
export class FtpSessionsOrchestratorService {
    private readonly serverHost: string;
    private readonly serverPort: number;

    constructor(configService: ConfigService) {
        this.serverHost = configService.get<string>('ftp.serverHost', 'localhost');
        this.serverPort = configService.get<number>('ftp.serverPort', 21);
    }

    async create() {
        const ftpSession = new FtpSession({
            host: this.serverHost,
            port: this.serverPort,
        });
        await ftpSession.launch();
        return ftpSession;
    }
}
