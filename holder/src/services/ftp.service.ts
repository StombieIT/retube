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

        this.ftpServer = new FtpSrv({
            url: this.url,
            anonymous: true,
        });
    }

    async onModuleInit() {
        this.ftpServer.on('login', (_, resolve) => {
            // TODO: мб добавить авторизацию
            // Разрешаем все подключения
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