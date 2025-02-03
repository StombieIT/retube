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

    constructor(config: ConfigService,
                private readonly fflow: FFlowService,
                private readonly path: PathService,
                private readonly ftpSessionsOrchestrator: FtpSessionsOrchestratorService) {
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

    async finishFlow(uploadSessionId: string, { savingPath }: FFlow.FinishParams) {
        await this.fflow.finishFlow(uploadSessionId);
        const uploadDir = this.path.dashFFlow(uploadSessionId);
        const ftpSession = await this.ftpSessionsOrchestrator.create();
        await ftpSession.createDir(savingPath);
        await ftpSession.uploadFromDir(
            uploadDir,
            savingPath,
        );
        this.logger.log(`Successfully uploaded files of ${uploadSessionId}`);
        await fs.rmdir(uploadDir, { recursive: true });
        ftpSession.destroy();
    }

    pushToFlow(uploadSessionId: string, buffer: Buffer) {
        this.fflow.pushToFlow(uploadSessionId, buffer);
    }
}
