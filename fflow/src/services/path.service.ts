import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FFlow } from '@stombie/retube-core';

@Injectable()
export class PathService {
    private readonly dataFolder: string;

    constructor(configService: ConfigService) {
        this.dataFolder = configService.get<string>('app.dataFolder', '/data');
    }

    uploadDir(uploadSessionId: string) {
        return path.join(this.dataFolder, uploadSessionId);
    }

    dashFFlow(uploadSessionId: string, filename?: string) {
        return path.join(this.dataFolder, this.dashFFlowPath(uploadSessionId, filename));
    }
    
    dashFFlowPath(uploadSessionId: string, filename?: string) {
        return this.fflowPath(uploadSessionId, 'dash', filename);
    }
    
    hlsFFlow(uploadSessionId: string, filename?: string) {
        return path.join(this.dataFolder, this.hlsFFlowPath(uploadSessionId, filename));
    }

    hlsFFlowPath(uploadSessionId: string, filename?: string) {
        return this.fflowPath(uploadSessionId, 'hls', filename);
    }

    fflow(uploadSessionId: string, format: FFlow.FFmpegFormat, filename?: string) {
        return path.join(this.dataFolder, this.fflowPath(uploadSessionId, format, filename));
    }

    fflowPath(uploadSessionId: string, format: FFlow.FFmpegFormat, filename?: string) {
        if (filename) {
            return path.join(uploadSessionId, format, filename);
        }
        return path.join(uploadSessionId, format);
    }
}
