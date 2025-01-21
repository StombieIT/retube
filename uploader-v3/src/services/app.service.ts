import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IVideoChunk } from '@stombie/retube-core';
import { ChunkConsumerService } from './chunk-consumer.service';
import { FFmpegProcessorService } from './ffmpeg-processor.service';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AppService.name);    

    constructor(private readonly chunkConsumer: ChunkConsumerService,
                private readonly ffmpegProcessor: FFmpegProcessorService) {
    }
    onModuleInit() {
        this.chunkConsumer.addListener('chunk', this.handleChunk);
    }
    onModuleDestroy() {
        this.chunkConsumer.removeListener('chunk', this.handleChunk);
    }

    private handleChunk = async (routingKey: string, chunk: IVideoChunk) => {
        const { sessionId, size, startByte } = chunk;
        this.logger.log('chunk', sessionId);
        await this.chunkConsumer.acceptMessageByCorrelationId(routingKey);
        // await this.ffmpegProcessor.pushToFlow(uploadSessionId, content);
        // // TODO: добавить обращение к БД
        // if (chunk.size < 4096) {
        //     await this.ffmpegProcessor.finishFlow(uploadSessionId);
        // }
    }
}
