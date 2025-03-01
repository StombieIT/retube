import { In, LessThanOrEqual, Repository } from 'typeorm';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Video, VideoStatus } from '@stombie/retube-core';
import { FFlowOrchestratorService } from './fflow-orchestrator.service';

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(SchedulerService.name);
    private readonly sleepTime: number;
    private readonly uploadingLifetimeMaximum: number;
    private readonly enabled: boolean;
    private timer: NodeJS.Timeout;

    constructor(
        private readonly fflowOrchestrator: FFlowOrchestratorService,
        @InjectRepository(Video) private readonly videos: Repository<Video>,
        configService: ConfigService
    ) {
        this.enabled = configService.get<boolean>('scheduler.enabled', false);
        this.sleepTime = configService.get<number>('scheduler.sleepTime', 60 * 1000);
        this.uploadingLifetimeMaximum = configService.get<number>('scheduler.uploadingLifetimeMaximum', 10 * 60 * 1000);
    }

    onModuleInit() {
        if (this.enabled) {
            this.tick();
        }
    }

    onModuleDestroy() {
        if (this.enabled && this.timer) {
            clearTimeout(this.timer);
        }
    }

    private getExpiredThreshold() {
        return new Date(Date.now() - this.uploadingLifetimeMaximum);
    }

    private tick = async () => {
        this.logger.debug('Scheduler tick');
        const expiredThreshold = this.getExpiredThreshold();
        const where = {
            createdAt: LessThanOrEqual(expiredThreshold),
            status: In([VideoStatus.CREATED, VideoStatus.UPLOADING]),
        };
        const videos = await this.videos.find({
            where,
            relations: {
                flows: {
                    uploadSession: true,
                },
            },
        });
        if (videos.length) {
            const uploadSessionIds = videos.flatMap((video) =>
                video.flows.map((flow) => flow.uploadSession),
            ).filter(Boolean).map((uploadSession) => uploadSession.id);
            this.logger.debug(`Need to delete: ${uploadSessionIds}`);
            for (const uploadSessionId of uploadSessionIds) {
                await this.fflowOrchestrator.deleteFlow(uploadSessionId);
            }
            await this.videos.delete(where);
        }
        this.timer = setTimeout(this.tick, this.sleepTime);
    }
}
