import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import { Flow, IVideoChunk, UploadSession, User, Video } from '@stombie/retube-core';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChunkExchangeService } from './chunk-exchange.service';

const MAX_CHUNK_LENGTH = 8192;

interface Pusher {
    chunkNumber: 0;
    chunks: Buffer[];
    sessionId: string;
}

@Injectable()
export class AppService implements OnModuleInit {
    private readonly logger = new Logger(AppService.name);
    // TODO: remove
    private readonly pusherById: Record<number, Pusher> = {};

    private video?: Video;

    constructor(private readonly chunkExchange: ChunkExchangeService,
                @InjectRepository(User) private readonly users: Repository<User>,
                @InjectRepository(Video) private readonly videos: Repository<Video>,
                @InjectRepository(Flow) private readonly flows: Repository<Flow>,
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
        const users = await this.users.find();
        if (!users.length) {
            this.logger.error('No users found');
        }
        const user = users[0];
        const files = await Promise.all([
            fs.readFile('/Users/vladislav.yartsev/Desktop/dev/personal/retube/gateway/src/test-video.mp4'),
            fs.readFile('/Users/vladislav.yartsev/Desktop/dev/personal/retube/gateway/src/test-video_1.mp4'),
        ]);
        const flows = await Promise.all(files.map(async (file) => {
            const flow = this.flows.create();
            await this.flows.save(flow);
            const uploadSession = this.uploadSessions.create({
                totalBytes: file.length,
                flow,
            });
            await this.uploadSessions.save(uploadSession);
            flow.uploadSession = uploadSession;
            return flow;
        }));
        const sessionIds = flows.map(flow => flow.uploadSession.id);
        this.video = this.videos.create({
            title: 'testing',
            description: 'testing description',
            duration: 10,
            user,
            flows,
        });
        
        await this.videos.save(this.video);
        const chunksList = files.map(file => {
            const chunkCount = Math.ceil(file.length / MAX_CHUNK_LENGTH);
            const chunks = [];
            for (let i = 0; i < chunkCount; i++) {
                const chunkStart = i * MAX_CHUNK_LENGTH;
                const chunkEnd = Math.min(
                    chunkStart + MAX_CHUNK_LENGTH,
                    file.length,
                );
                chunks.push(file.subarray(chunkStart, chunkEnd));
            }
            return chunks;
        });
        chunksList.forEach((chunks, idx) => {
            this.pusherById[idx] = {
                chunkNumber: 0,
                chunks,
                sessionId: sessionIds[idx],
            };
            this.initPushing(idx);
        });
    }

    async initPushing(id: number) {
        const pusher = this.pusherById[id];
        const { chunks, chunkNumber } = pusher;
        const chunk = chunks[chunkNumber];
        const chunkMessage: IVideoChunk = {
            sessionId: pusher.sessionId,
            content: chunk,
            startByte: chunkNumber * MAX_CHUNK_LENGTH,
            size: chunk.length,
        };
        await this.chunkExchange.push(chunkMessage);
        console.log('handled');
        setTimeout(() => {
            pusher.chunkNumber++;
            if (pusher.chunkNumber < pusher.chunks.length) {
                this.initPushing(id);
            }
        }, 1000);
    }
}
