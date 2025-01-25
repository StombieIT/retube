import * as fs from 'fs/promises';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FFlowService } from './fflow.service';
import { PathService } from './path.service';
import { FtpClientService } from './ftp-client.service';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);
    private readonly dashManifestFilename: string;

    constructor(config: ConfigService,
                private readonly fflow: FFlowService,
                private readonly path: PathService,
                private readonly ftpClient: FtpClientService) {
        const manifestName = config.get<string>('ffmpeg.manifestName', 'manifest');
        this.dashManifestFilename = `${manifestName}.mpd`;
    }

    async createFlow(uploadSessionId: string) {
        const uploadDir = this.path.dashFFlow(uploadSessionId);
        const uploadPath = this.path.dashFFlow(uploadSessionId, this.dashManifestFilename);
        await Promise.all([
            fs.mkdir(uploadDir, { recursive: true }),
            this.fflow.createFlow(uploadSessionId, uploadPath),
        ]);
    }

    async deleteFlow(uploadSessionId: string) {
        await this.fflow.deleteFlow(uploadSessionId);
        const uploadDir = this.path.dashFFlow(uploadSessionId);
        await fs.rmdir(uploadDir);
    }

    async finishFlow(uploadSessionId: string) {
        await this.fflow.finishFlow(uploadSessionId);
        const ftpUploadDir = this.path.dashFFlowPath(uploadSessionId);
        const uploadDir = this.path.dashFFlow(uploadSessionId);
        await this.ftpClient.rawCreateDir(ftpUploadDir);
        await this.ftpClient.rawUploadFromDir(
            uploadDir,
            ftpUploadDir
        );
        this.logger.log(`Successfully uploaded files of ${uploadSessionId}`);
        await fs.rmdir(uploadDir, { recursive: true });
    }

    pushToFlow(uploadSessionId: string, buffer: Buffer) {
        this.fflow.pushToFlow(uploadSessionId, buffer);
    }
}
