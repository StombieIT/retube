import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FFlow, UploadSessionId } from '@stombie/retube-core';

@Injectable()
export class PathService {
    private readonly logger = new Logger(PathService.name);
    private readonly dataFolder: string;

    constructor(configService: ConfigService) {
        this.dataFolder = configService.get<string>('app.dataFolder', '/data');
        this.logger.log(`PathService started with data folder path: ${this.dataFolder}`);
    }

    dashFFlow(uploadSessionId: UploadSessionId, filename?: string) {
        return path.join(this.dataFolder, this.dashFFlowPath(uploadSessionId, filename));
    }

    dashFFlowPath(uploadSessionId: UploadSessionId, filename?: string) {
        this.logger.log(`dashFFlowPath: ${this.fflowPath(uploadSessionId, 'dash', filename)}`);
        return this.fflowPath(uploadSessionId, 'dash', filename);
    }

    fflow(uploadSessionId: UploadSessionId, format: FFlow.FFmpegFormat, filename?: string) {
        return path.join(this.dataFolder, this.fflowPath(uploadSessionId, format, filename));
    }

    fflowPath(uploadSessionId: UploadSessionId, format: FFlow.FFmpegFormat, filename?: string) {
        if (filename) {
            this.logger.log(`fflowPath: ${path.join(uploadSessionId, format, filename)}`);
            this.logger.log(`fflowPath: ${path.join(uploadSessionId, format, filename)}`);
            return path.join(uploadSessionId, format, filename);
        }
        this.logger.log(`fflowPath: ${path.join(uploadSessionId, format)}`);
        return path.join(uploadSessionId, format);
    }
}
