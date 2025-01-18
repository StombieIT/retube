import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'basic-ftp';
import { Limiter, limiter } from '../utils/async';

@Injectable()
export class FtpClientService implements OnModuleInit {
    private readonly logger = new Logger(FtpClientService.name);
    private readonly client: Client;
    private readonly serverHost: string;
    private readonly serverPort: number;
    private readonly operationsLimit: number;
    private limit: Limiter;

    constructor(configService: ConfigService) {
        this.client = new Client();
        this.serverHost = configService.get<string>('ftp.serverHost', 'localhost');
        this.serverPort = configService.get<number>('ftp.serverPort', 21);
        this.operationsLimit = configService.get<number>('ftp.operationsLimit', 5);
        this.limit = limiter(this.operationsLimit);
    }    

    async onModuleInit() {
        await this.client.access({
            host: this.serverHost,
            port: this.serverPort,
        });
        this.logger.log(`Successfully connected to ftp://${this.serverHost}:${this.serverPort}`);
    }

    createDir(dirPath: string) {
        return this.limit(() => this.rawCreateDir(dirPath));
    }

    uploadFromDir(source: string, toRemotePath: string) {
        return this.limit(() => this.rawUploadFromDir(source, toRemotePath));
    }

    async rawCreateDir(dirPath: string) {
        this.logger.log(`Creating dir: ${dirPath}`);
        await this.client.send(`MKD ${dirPath}`);
        this.logger.log(`Successfully created dir: ${dirPath}`);
    }

    async rawUploadFromDir(source: string, toRemotePath: string) {
        this.logger.log(`Uploading: from ${source} to ${toRemotePath}`);
        await this.client.uploadFromDir(source, toRemotePath);
        this.logger.log(`Successfully uploaded: from ${source} to ${toRemotePath}`);
    }
}
