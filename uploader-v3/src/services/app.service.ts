import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IVideoChunk } from '@stombie/retube-core';
import { ChunkConsumerService } from './chunk-consumer.service';
import { FFmpegProcessorService } from './ffmpeg-processor.service';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly chunkConsumer: ChunkConsumerService,
                private readonly ffmpegProcessor: FFmpegProcessorService) {
    }
    onModuleInit() {
        this.chunkConsumer.addListener('chunk', this.handleChunk);
    }
    onModuleDestroy() {
        this.chunkConsumer.removeListener('chunk', this.handleChunk);
    }

    private handleChunk = async (messageId: string, chunk: IVideoChunk) => {
        const { content } = chunk;
        console.log('chunk', content);
        const uploadSessionId = 'testing';
        await this.ffmpegProcessor.pushToFlow(uploadSessionId, content);
        // TODO: добавить обращение к БД
        if (chunk.size < 4096) {
            await this.ffmpegProcessor.finishFlow(uploadSessionId);
        }
    }
}
