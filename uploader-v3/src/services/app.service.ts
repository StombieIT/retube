import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IVideoChunk, UploadSession } from '@stombie/retube-core';
import { ChunkConsumerService } from './chunk-consumer.service';
import { FFmpegProcessorService } from './ffmpeg-processor.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AppService.name);    

    constructor(private readonly chunkConsumer: ChunkConsumerService,
                private readonly ffmpegProcessor: FFmpegProcessorService,
                @InjectRepository(UploadSession) private readonly uploadSessions: Repository<UploadSession>) {
    }
    onModuleInit() {
        this.chunkConsumer.addListener('chunk', this.handleChunk);
    }
    onModuleDestroy() {
        this.chunkConsumer.removeListener('chunk', this.handleChunk);
    }

    private handleChunk = async (correlationId: string, chunk: IVideoChunk) => {
        const { sessionId, size, startByte } = chunk;
        this.logger.log('chunk', sessionId);
        const uploadSession = await this.uploadSessions.findOneBy({
            id: sessionId,
        });
        const updatedUploadedBytes = startByte + size;
        if (!uploadSession ||
            startByte !== uploadSession.uploadedBytes ||
            updatedUploadedBytes > uploadSession.totalBytes) {
            return await this.chunkConsumer.dropMessageByCorrelationId(correlationId);
        }
        // TODO: добавить fflow processing
        await this.uploadSessions.update(sessionId, { uploadedBytes: updatedUploadedBytes });
        await this.chunkConsumer.acceptMessageByCorrelationId(correlationId);
    }
}
