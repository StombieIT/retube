


import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { FFlow, UploadSessionId } from '@stombie/retube-core';

@Injectable()
export class PathService {
    private readonly rootPath: string;

    constructor(configService: ConfigService) {
        this.rootPath = configService.get<string>('app.rootPath', '/data');
    }

    // Общая генерация пути для указанного формата
    fflowDir(uploadSessionId: UploadSessionId, format?: FFlow.FFmpegFormat): string {
        if (!format) {
            return path.resolve(this.rootPath, uploadSessionId);
        }
        return path.resolve(this.rootPath, uploadSessionId, format);
    }
}
