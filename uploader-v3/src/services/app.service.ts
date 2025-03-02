import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Flow, FlowStatus, IVideoChunk, UploadSession, Video, VideoStatus } from '@stombie/retube-core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChunkConsumerService } from './chunk-consumer.service';
import { FFlowOrchestratorService } from './fflow-orchestrator.service';
import { retry } from '../helpers';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly chunkConsumer: ChunkConsumerService,
                private readonly fflowOrchestrator: FFlowOrchestratorService,
                @InjectRepository(UploadSession) private readonly uploadSessions: Repository<UploadSession>,
                @InjectRepository(Flow) private readonly flows: Repository<Flow>,
                @InjectRepository(Video) private readonly videos: Repository<Video>) {
    }

    onModuleInit() {
        this.chunkConsumer.addListener('chunk', this.handleChunk);
    }

    onModuleDestroy() {
        this.chunkConsumer.removeListener('chunk', this.handleChunk);
    }

    private handleChunk = async (correlationId: string, chunk: IVideoChunk) => {
        const { sessionId, size, startByte, content } = chunk;
        const uploadSession = await retry(() => this.uploadSessions.findOne({
            relations: {
                flow: {
                    video: true,
                },
            },
            where: {
                id: sessionId,
            },
        }));
        const updatedUploadedBytes = startByte + size;
        if (!uploadSession ||
            startByte !== uploadSession.uploadedBytes ||
            updatedUploadedBytes > uploadSession.totalBytes) {
            return await this.chunkConsumer.dropMessageByCorrelationId(correlationId);
        }
        await this.fflowOrchestrator.ensureFlow(sessionId);
        await retry(() => this.fflowOrchestrator.pushToFlow(sessionId, content));
        await retry(() => this.uploadSessions.update(sessionId, {
            uploadedBytes: updatedUploadedBytes,
        }));
        if (updatedUploadedBytes === uploadSession.totalBytes) {
            const { flow } = uploadSession;
            const { video } = flow;
            await retry(() => this.fflowOrchestrator.finishFlow(sessionId, {
                savingPath: `/${video.id}/${flow.id}`,
            }));
            await retry(() => this.flows.update(flow.id, {
                status: FlowStatus.DISTRIBUTED,
                uploadedAt: new Date(),
            }));
            const flows = await retry(() => this.flows.find({
                where: {
                    video: {
                        id: video.id,
                    },
                },
            }));
            const allDistributed = flows.every(flow => flow.status === FlowStatus.DISTRIBUTED);
            if (allDistributed) {
                await retry(() => this.videos.update(video.id, {
                    status: VideoStatus.DISTRIBUTED,
                }));
            }
            await retry(() => this.uploadSessions.delete(sessionId));
        }
        await retry(() => this.chunkConsumer.acceptMessageByCorrelationId(correlationId));
    }
}
