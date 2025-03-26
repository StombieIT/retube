import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FtpSrv } from 'ftp-srv';

@Injectable()
export class FtpService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(FtpService.name);
    private readonly ftpServer: FtpSrv;
    private readonly rootPath: string;
    private readonly url: string;

    constructor(configService: ConfigService) {
        this.rootPath = configService.get<string>('app.rootPath');
        this.url = configService.get<string>('ftp.url', 'ftp://0.0.0.0:21');
        const pasvMinPort = configService.get<number>('ftp.pasvMinPort', 4000);
        const pasvMaxPort = configService.get<number>('ftp.pasvMaxPort', 4004);

        this.ftpServer = new FtpSrv({
            url: this.url,
            anonymous: true,
            pasv_min: pasvMinPort,
            pasv_max: pasvMaxPort,
        });
    }

    async onModuleInit() {
        this.ftpServer.on('login', (_, resolve) => {
            this.logger.log('Attempt to login');
            resolve({ root: this.rootPath });
        });

        await this.ftpServer.listen();
        this.logger.log(`FTP server successfully started on url ${this.url}`);
    }

    async onModuleDestroy() {
        await this.ftpServer.close();
        this.logger.log('FTP server successfully stopped');
    }
}