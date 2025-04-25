import { FFlow } from '@stombie/retube-core';
import * as fs from 'fs/promises';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FFlowService } from './fflow.service';
import { PathService } from './path.service';
import { FtpSessionsOrchestratorService } from './ftp-sessions-orchestrator.service';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);
    private readonly dashManifestFilename: string;
    private readonly hlsManifestFilename: string;

    constructor(config: ConfigService,
                private readonly fflow: FFlowService,
                private readonly path: PathService,
                private readonly ftpSessionsOrchestrator: FtpSessionsOrchestratorService) {
        const manifestName = config.get<string>('ffmpeg.manifestName', 'manifest');
        this.dashManifestFilename = `${manifestName}.mpd`;
        this.hlsManifestFilename = `${manifestName}.m3u8`;
    }

    async createFlow(uploadSessionId: string) {
        const hlsUploadDir = this.path.hlsFFlow(uploadSessionId);
        const dashUploadDir = this.path.dashFFlow(uploadSessionId);
        const hlsUploadPath = this.path.hlsFFlow(uploadSessionId, this.hlsManifestFilename);
        const dashUploadPath = this.path.dashFFlow(uploadSessionId, this.dashManifestFilename);
        await Promise.all([
            fs.mkdir(hlsUploadDir, { recursive: true }),
            fs.mkdir(dashUploadDir, { recursive: true }),
            this.fflow.createFlow(uploadSessionId, {
                hlsOutput: hlsUploadPath,
                dashOutput: dashUploadPath,
            }),
        ]);
    }

    async deleteFlow(uploadSessionId: string) {
        await this.fflow.deleteFlow(uploadSessionId);
        const uploadDir = this.path.uploadDir(uploadSessionId);
        await fs.rm(uploadDir, { recursive: true, force: true });
    }

    async finishFlow(uploadSessionId: string, { savingPath }: FFlow.FinishParams) {
        try {
            await this.fflow.finishFlow(uploadSessionId);
            const uploadDir = this.path.uploadDir(uploadSessionId);
            const ftpSession = await this.ftpSessionsOrchestrator.create();
            await ftpSession.createDir(savingPath);
            await ftpSession.uploadFromDir(
                uploadDir,
                savingPath,
            );
            this.logger.log(`Successfully uploaded files of ${uploadSessionId}`);
            await fs.rm(uploadDir, { recursive: true, force: true });
            ftpSession.destroy();
        } catch (err) {
            this.logger.error(`finishFlow: ${err.message}`);
            throw err;
        }
    }

    pushToFlow(uploadSessionId: string, buffer: Buffer) {
        this.fflow.pushToFlow(uploadSessionId, buffer);
    }
}
