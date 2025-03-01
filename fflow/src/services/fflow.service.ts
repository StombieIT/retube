import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChildProcess, spawn } from 'child_process';
import { FlowNotFoundError } from '../errors/flow-not-found.error';
import { FlowAlreadyExistsError } from '../errors/flow-already-exists.error';
import { FFmpegArg, ffmpegArgsBuilder } from '../utils/ffmpeg';

export interface CreateFlowParams {
    dashOutput: string;
    hlsOutput: string;
}

@Injectable()
export class FFlowService {
    private readonly logger = new Logger(FFlowService.name);
    private readonly flowBySessionId: Record<string, ChildProcess>;
    private readonly videoCodec: string;
    private readonly audioCodec: string;
    private readonly videoBitrate: string;
    private readonly audioBitrate: string;
    private readonly dashSegmentDuration: number;
    private readonly dashSegmentFormat: string;
    private readonly hlsTime: number;
    private readonly hlsPlaylistType: string;

    private readonly logLevel: string;

    constructor(configService: ConfigService) {
        this.flowBySessionId = {};
        this.videoCodec = configService.get<string>('ffmpeg.videoCodec', 'libx264');
        this.audioCodec = configService.get<string>('ffmpeg.audioCodec', 'aac');
        this.videoBitrate = configService.get<string>('ffmpeg.videoBitrate', '5000k');
        this.audioBitrate = configService.get<string>('ffmpeg.audioBitrate', '192k');
        this.dashSegmentDuration = configService.get<number>('ffmpeg.dashSegmentDuration', 10);
        this.dashSegmentFormat = configService.get<string>('ffmpeg.dashSegmentFormat', 'mp4');
        this.hlsTime = configService.get<number>('ffmpeg.hlsTime', 4);
        this.hlsPlaylistType = configService.get<string>('hlsPlaylistType', 'vod');
        this.logLevel = configService.get<string>('ffmpeg.logLevel', 'debug');
    }

    // TODO: мб добавить подвязку не на uploadSessionId, а на встроенном айдишнике линии
    createFlow(uploadSessionId: string, { dashOutput, hlsOutput }: CreateFlowParams) {
        const args = ffmpegArgsBuilder()
            .addInput('pipe:0')
            .addArg(FFmpegArg.VIDEO_CODEC, this.videoCodec)
            .addArg(FFmpegArg.AUDIO_CODEC, this.audioCodec)
            .addArg(FFmpegArg.VIDEO_BITRATE, this.videoBitrate)
            .addArg(FFmpegArg.AUDIO_BITRATE, this.audioBitrate)
            .addArg(FFmpegArg.FORMAT, 'dash')
            .addArg(FFmpegArg.SEGMENT_DURATION, this.dashSegmentDuration)
            .addArg(FFmpegArg.SEGMENT_FORMAT, this.dashSegmentFormat)
            .addArg(FFmpegArg.LOG_LEVEL, this.logLevel)
            .addOutput(dashOutput)
            .addArg(FFmpegArg.FORMAT, 'hls')
            .addArg(FFmpegArg.HLS_PLAYLIST_TYPE, this.hlsPlaylistType)
            .addArg(FFmpegArg.HLS_TIME, this.hlsTime)
            .addOutput(hlsOutput)
            .build();
        this.logger.log(`args ${args}`);
        if (this.flowBySessionId[uploadSessionId]) {
            throw new FlowAlreadyExistsError(uploadSessionId);
        }
        const process = spawn('ffmpeg', args);
        process.stderr.on('data', data => {
            this.logger.debug(`DEBUG<${uploadSessionId}>: ${data}`);
        });
        process.stdout.on('data', data => {
            this.logger.debug(`INFO<${uploadSessionId}>: ${data}`);
        });
        this.flowBySessionId[uploadSessionId] = process;
    }
    
    async deleteFlow(uploadSessionId: string) {
        this.checkFlowExistance(uploadSessionId);
        await this.killFlow(uploadSessionId);
        // TODO: добавить очистку ресурсов
    }

    pushToFlow(uploadSessionId: string, buffer: Buffer) {
        this.checkFlowExistance(uploadSessionId);
        this.flowBySessionId[uploadSessionId].stdin.write(buffer);
        // TODO: добавить ожидание обработки данных ffmpeg'ом
    }

    async finishFlow(uploadSessionId: string): Promise<void> {
        this.checkFlowExistance(uploadSessionId);
        const destroyPromise = this.listenDestroy(uploadSessionId);
        this.flowBySessionId[uploadSessionId].stdin.end();
        await destroyPromise;
        console.log(`finishFlow: Successfully finished with ${uploadSessionId}`);
        delete this.flowBySessionId[uploadSessionId];
    }

    private async killFlow(uploadSessionId: string) {
        const destroyPromise = this.listenDestroy(uploadSessionId);
        this.flowBySessionId[uploadSessionId].kill('SIGKILL');
        await destroyPromise;
        delete this.flowBySessionId[uploadSessionId];
    }

    private listenDestroy(uploadSessionId: string) {
        const destroyTasks = [
            new Promise(resolve => {
                this.flowBySessionId[uploadSessionId].on('exit', resolve);
            }),
            new Promise(resolve => {
                this.flowBySessionId[uploadSessionId].on('close', resolve)
            })
        ];
        return Promise.all(destroyTasks);
    }

    private checkFlowExistance(uploadSessionId: string) {
        if (!this.flowBySessionId[uploadSessionId]) {
            throw new FlowNotFoundError(uploadSessionId);
        }
    }
}