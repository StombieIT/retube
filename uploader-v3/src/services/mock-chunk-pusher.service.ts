import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { connect as amqpConnect, Channel, Connection } from 'amqplib';

const MAX_CHUNK_LENGTH = 4096;

@Injectable()
export class MockChunkPusher implements OnModuleInit, OnModuleDestroy { 
    private readonly amqpConnectionString: string;
    private readonly queue: string;
    private readonly uploadSessionId: string;

    private connection: Maybe<Connection>;
    private channel: Maybe<Channel>;
    private timer: ReturnType<typeof setTimeout>;
    private video: Buffer;
    private chunkNumber = 0;

    constructor(configService: ConfigService) {
        this.uploadSessionId = Date.now().toString();
        this.amqpConnectionString = configService.get<string>('AMQP_CONNECTION_STRING', 'amqp://localhost');
        this.queue = configService.get<string>('CHUNK_UPLOAD_AMQP_QUEUE', 'chunk-upload');
    }
    
    async onModuleInit() {
        this.connection = await amqpConnect(this.amqpConnectionString);
        this.channel = await this.connection.createChannel();
        
        await this.channel.assertQueue(this.queue);
        this.video = await readFile(
            '/Users/vladislav.yartsev/Desktop/dev/personal/retube/uploader-v3/src/test-video.mp4'
        );

        this.initPushing();
    }

    onModuleDestroy() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    initPushing() {
        this.timer = setTimeout(() => {
            const chunkStart = this.chunkNumber * MAX_CHUNK_LENGTH;
            const chunkEnd = Math.min(chunkStart + MAX_CHUNK_LENGTH, this.video.length);
            const buffer = this.video.subarray(chunkStart, chunkEnd);

            const headers = {
                'x-upload-session-id': this.uploadSessionId,
                'x-start-byte': chunkStart,
                'x-size': chunkEnd - chunkStart,
            };
            this.channel.sendToQueue(this.queue, buffer, { headers, messageId: String(Date.now()) });
            this.chunkNumber++;
            this.initPushing();
        }, 1000);
    }
}
