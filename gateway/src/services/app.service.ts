import { Repository } from 'typeorm';
import { Flow, Gateway, IVideoChunk, NoRightsError, NotFoundError, UploadSession, User, Video } from '@stombie/retube-core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChunkExchangeService } from './chunk-exchange.service';
import { VideoConverterService } from './converters/video.converter';

const MAX_CHUNK_LENGTH = 8192;

interface Pusher {
    chunkNumber: 0;
    chunks: Buffer[];
    sessionId: string;
}

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);
    // TODO: remove
    private readonly pusherById: Record<number, Pusher> = {};

    private video?: Video;

    constructor(private readonly chunkExchange: ChunkExchangeService,
                @InjectRepository(User) private readonly users: Repository<User>,
                @InjectRepository(Video) private readonly videos: Repository<Video>,
                @InjectRepository(Flow) private readonly flows: Repository<Flow>,
                @InjectRepository(UploadSession) private readonly uploadSessions: Repository<UploadSession>,
                private readonly videoConverter: VideoConverterService) {
    }

    async createVideo({ title, description, totalBytesList }: Gateway.VideoPayload, owner: User): Promise<Gateway.SmallVideo> {
        const video = this.videos.create({
            title,
            description,
            user: owner,
        });
        await this.videos.save(video);
        const flows = totalBytesList.map(() => this.flows.create({
            video,
        }));
        await this.flows.save(flows);
        const uploadSessions = totalBytesList.map((totalBytes, idx) => {
            const flow = flows[idx];
            const uploadSession = this.uploadSessions.create({
                totalBytes,
                flow,
            });
            return uploadSession;
        });
        await this.uploadSessions.save(uploadSessions);

        flows.forEach((flow, idx) => {
            flow.uploadSession = uploadSessions[idx];
        });
        video.flows = flows;
        return this.videoConverter.toSmallVideo(video);
    }

    async upload(chunk: IVideoChunk, owner: User) {
        const { sessionId } = chunk;
        const uploadSession = await this.uploadSessions.findOne({
            where: {
                id: sessionId,
            },
            relations: {
                flow: {
                    video: {
                        user: true,
                    },
                },
            },
        });
        
        if (!uploadSession) {
            throw new NotFoundError(`Session ${sessionId} not found`);
        }
        const { flow } = uploadSession;
        const { video } = flow;
        const { user } = video;
        if (user.id !==  owner.id) {
            throw new NoRightsError('Session owner mismatches');
        }

        await this.chunkExchange.push(chunk);
    }

    async state(videoId: string): Promise<Gateway.SmallVideo> {
        const video = await this.videos.findOne({
            where: {
                id: videoId,
            },
            relations: {
                flows: {
                    uploadSession: true,
                },
            },
        });

        if (!video) {
            throw new NotFoundError(`Video ${videoId} is not found`);
        }

        return this.videoConverter.toSmallVideo(video);
    }
}
