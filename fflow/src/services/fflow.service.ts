import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FFlow, UploadSessionId } from '@stombie/retube-core';
import { ChildProcess, spawn } from 'child_process';
import { FlowNotFoundError } from '../errors/flow-not-found.error';
import { FlowAlreadyExistsError } from '../errors/flow-already-exists.error';
import { FFmpegArg, ffmpegArgsBuilder } from '../utils/ffmpeg';

@Injectable()
export class FFlowService {
    private readonly logger = new Logger(FFlowService.name);
    private readonly flowBySessionId: Record<UploadSessionId, ChildProcess>;
    private readonly videoCodec: string;
    private readonly audioCodec: string;
    private readonly videoBitrate: string;
    private readonly audioBitrate: string;
    private readonly format: FFlow.FFmpegFormat;
    private readonly segmentDuration: number;
    private readonly segmentFormat: string;
    private readonly logLevel: string;

    constructor(configService: ConfigService) {
        this.flowBySessionId = {};
        this.videoCodec = configService.get<string>('ffmpeg.videoCodec', 'libx264');
        this.audioCodec = configService.get<string>('ffmpeg.audioCodec', 'aac');
        this.videoBitrate = configService.get<string>('ffmpeg.videoBitrate', '5000k');
        this.audioBitrate = configService.get<string>('ffmpeg.audioBitrate', '192k');
        this.format = configService.get<FFlow.FFmpegFormat>('ffmpeg.format', 'dash');
        this.segmentDuration = configService.get<number>('ffmpeg.segmentDuration', 10);
        this.segmentFormat = configService.get<string>('ffmpeg.segmentFormat', 'mp4');
        this.logLevel = configService.get<string>('ffmpeg.logLevel', 'debug');
    }

    // TODO: мб добавить подвязку не на uploadSessionId, а на встроенном айдишнике линии
    createFlow(uploadSessionId: UploadSessionId, output: string) {
        const args = ffmpegArgsBuilder()
            .addInput('pipe:0')
            .addArg(FFmpegArg.VIDEO_CODEC, this.videoCodec)
            .addArg(FFmpegArg.AUDIO_CODEC, this.audioCodec)
            .addArg(FFmpegArg.VIDEO_BITRATE, this.videoBitrate)
            .addArg(FFmpegArg.AUDIO_BITRATE, this.audioBitrate)
            .addArg(FFmpegArg.FORMAT, this.format)
            .addArg(FFmpegArg.SEGMENT_DURATION, this.segmentDuration)
            .addArg(FFmpegArg.SEGMENT_FORMAT, this.segmentFormat)
            .addArg(FFmpegArg.LOG_LEVEL, this.logLevel)
            .addOutput(output)
            .build();
        this.logger.log(`createFlow: uploadSessionId: ${uploadSessionId}: ${output}`);
        if (this.flowBySessionId[uploadSessionId]) {
            throw new FlowAlreadyExistsError(uploadSessionId);
        }
        const process = spawn('ffmpeg', args);
        process.stderr.on('data', data => {
            this.logger.debug(`DEBUG<${uploadSessionId}>: ${data}`);
        });
        process.stdout.on('data', data => {
            console.info(`INFO<${uploadSessionId}>: ${data}`);
        });
        this.flowBySessionId[uploadSessionId] = process;
    }
    
    async deleteFlow(uploadSessionId: UploadSessionId) {
        this.checkFlowExistance(uploadSessionId);
        await this.killFlow(uploadSessionId);
        // TODO: добавить очистку ресурсов
    }

    pushToFlow(uploadSessionId: UploadSessionId, buffer: Buffer) {
        this.checkFlowExistance(uploadSessionId);
        this.flowBySessionId[uploadSessionId].stdin.write(buffer);
        // TODO: добавить ожидание обработки данных ffmpeg'ом
    }

    async finishFlow(uploadSessionId: UploadSessionId): Promise<void> {
        this.checkFlowExistance(uploadSessionId);
        const destroyPromise = this.listenDestroy(uploadSessionId);
        this.flowBySessionId[uploadSessionId].stdin.end();
        await destroyPromise;
        console.log(`finishFlow: Successfully finished with ${uploadSessionId}`);
        delete this.flowBySessionId[uploadSessionId];
    }

    private async killFlow(uploadSessionId: UploadSessionId) {
        const destroyPromise = this.listenDestroy(uploadSessionId);
        this.flowBySessionId[uploadSessionId].kill();
        await destroyPromise;
        delete this.flowBySessionId[uploadSessionId];
    }

    private listenDestroy(uploadSessionId: UploadSessionId) {
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

    private checkFlowExistance(uploadSessionId: UploadSessionId) {
        if (!this.flowBySessionId[uploadSessionId]) {
            throw new FlowNotFoundError(uploadSessionId);
        }
    }
}