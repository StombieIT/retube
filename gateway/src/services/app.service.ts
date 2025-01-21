import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import { Flow, UploadSession, User, Video } from '@stombie/retube-core';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChunkExchangeService } from './chunk-exchange.service';

const MAX_CHUNK_LENGTH = 4096;

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AppService.name);

    private video?: Video;

    constructor(private readonly chunkExchange: ChunkExchangeService,
                @InjectRepository(User) private readonly usersRepository: Repository<User>,
                @InjectRepository(Video) private readonly videosRepository: Repository<Video>,
                @InjectRepository(Flow) private readonly flowsRepository: Repository<Flow>,
                @InjectRepository(UploadSession) private readonly uploadSessions: Repository<UploadSession>) {
    }

    async onModuleInit() {
        await this.chunkExchange.onModuleInit();
        const chunk = {
            sessionId: Date.now().toString(),
            startByte: 0,
            size: 1500,
            content: Buffer.from(Array(1500).fill(1))
        };
        await this.chunkExchange.push(chunk);
        this.logger.log(`accept chunk: ${chunk.sessionId}`);
        // this.logger.log(`Handled chunk ${chunk}`);
        // const users = await this.usersRepository.find();
        // if (!users.length) {
        //     this.logger.error('No users found');
        // }
        // const user = users[0];
        // const files = await Promise.all([
        //     fs.readFile('/Users/vladislav.yartsev/Desktop/dev/personal/retube/gateway/src/test-video.mp4'),
        //     fs.readFile('/Users/vladislav.yartsev/Desktop/dev/personal/retube/gateway/src/test-video_1.mp4'),
        // ]);
        // const flows = await Promise.all(files.map(async (file) => {
        //     const flow = this.flowsRepository.create();
        //     await this.flowsRepository.save(flow);
        //     const uploadSession = this.uploadSessions.create({
        //         total_bytes: file.length,
        //         flow,
        //     });
        //     await this.uploadSessions.save(uploadSession);
        //     return flow;
        // }));
        // this.video = this.videosRepository.create({
        //     title: 'testing',
        //     description: 'testing description',
        //     duration: 10,
        //     user,
        //     flows,
        // });
        // await this.videosRepository.save(this.video);
        // this.logger.log(`Created video ${this.video}`);

    }

    async onModuleDestroy() {
        // if (this.video) {
        //     await this.videosRepository.remove(this.video);
        //     this.logger.log(`Deleted video: ${this.video.id}`);
        // }
    }
}
