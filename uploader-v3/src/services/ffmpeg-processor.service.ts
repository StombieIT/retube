import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiService } from './api.service';

@Injectable()
export class FFmpegProcessorService {
    private readonly videoCodec: string;
    private readonly audioCodec: string;
    private readonly videoBitrate: string;
    private readonly audioBitrate: string;
    private readonly segmentDuration: number;
    private readonly segmentFormat: string;

    constructor(private readonly api: ApiService, configService: ConfigService) {
        this.videoCodec = configService.get<string>('ffmpeg.videoCodec');
        this.audioCodec = configService.get<string>('ffmpeg.audioCodec');
        this.videoBitrate = configService.get<string>('ffmpeg.videoBitrate');
        this.audioBitrate = configService.get<string>('ffmpeg.audioBitrate');
        this.segmentDuration = configService.get<number>('ffmpeg.segmentDuration');
        this.segmentFormat = configService.get<string>('ffmpeg.segmentFormat');
    }
}
