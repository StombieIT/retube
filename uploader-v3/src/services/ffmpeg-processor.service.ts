import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadSessionId } from '@stombie/retube-core';
import { ApiService } from './api.service';
import { FFlowCacheService } from './fflow-cache.service';
import { FFmpegArg, ffmpegArgsBuilder } from 'src/utils/ffmpeg';
import { FFmpegFormat } from '../types/ffmpeg';

// TODO: мб вообще не нужен, перенести все в AppService
@Injectable()
export class FFmpegProcessorService {
    private readonly videoCodec: string;
    private readonly audioCodec: string;
    private readonly videoBitrate: string;
    private readonly audioBitrate: string;
    private readonly format: FFmpegFormat;
    private readonly segmentDuration: number;
    private readonly segmentFormat: string;
    // TODO: remove
    private readonly localFileStorage: string;

    constructor(private readonly api: ApiService,
                private readonly fflowCache: FFlowCacheService,
                configService: ConfigService) {
        this.videoCodec = configService.get<string>('ffmpeg.videoCodec');
        this.audioCodec = configService.get<string>('ffmpeg.audioCodec');
        this.videoBitrate = configService.get<string>('ffmpeg.videoBitrate');
        this.audioBitrate = configService.get<string>('ffmpeg.audioBitrate');
        this.format = configService.get<FFmpegFormat>('ffmpeg.format');
        this.segmentDuration = configService.get<number>('ffmpeg.segmentDuration');
        this.segmentFormat = configService.get<string>('ffmpeg.segmentFormat');
        this.localFileStorage = configService.get<string>('LOCAL_FILE_STORAGE');
    }

    // TODO: добавить отдельный класс для работы с флоу
    async pushToFlow(uploadSessionId: UploadSessionId, buffer: Buffer) {
        let flowUrl: string;
        const flowExists = await this.fflowCache.isFlowExists(uploadSessionId);
        if (flowExists) {
            const cachedFlowUrl = await this.fflowCache.getFlowUrl(uploadSessionId);
            if (!cachedFlowUrl) {
                throw new Error('pushToFlow: No flow url got from fflow cache');
            }
            flowUrl = cachedFlowUrl;
        } else {
            // TODO: добавить также формат HLS
            const args = ffmpegArgsBuilder()
                .addInput('pipe:0')
                .addArg(FFmpegArg.VIDEO_CODEC, this.videoCodec)
                .addArg(FFmpegArg.AUDIO_CODEC, this.audioCodec)
                .addArg(FFmpegArg.VIDEO_BITRATE, this.videoBitrate)
                .addArg(FFmpegArg.AUDIO_BITRATE, this.audioBitrate)
                .addArg(FFmpegArg.FORMAT, this.format)
                .addArg(FFmpegArg.SEGMENT_DURATION, this.segmentDuration)
                .addArg(FFmpegArg.SEGMENT_FORMAT, this.segmentFormat)
                // TODO: добавить ftp сервер
                .addOutput(this.localFileStorage)
                .build();
            const { data } = await this.api.createFlow(uploadSessionId, args);
            flowUrl = data.flowUrl;
            await this.fflowCache.addFlowUrl(uploadSessionId, flowUrl);
        }
        const pushUrl = `${flowUrl}/push`;
        await this.api.pushToFlow(pushUrl, buffer);
    }

    async finishFlow(uploadSessionId: UploadSessionId) {
        const flowExists = await this.fflowCache.isFlowExists(uploadSessionId);
        if (!flowExists) {
            throw new Error(`finishFlow: No flow with uploadSessionId ${uploadSessionId} found`);
        }
        const flowUrl = await this.fflowCache.getFlowUrl(uploadSessionId);
        const finishUrl = `${flowUrl}/finish`;
        await this.api.finishFlow(finishUrl);
        await this.fflowCache.deleteFlowUrl(uploadSessionId);
    }
}
