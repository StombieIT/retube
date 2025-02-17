import { randomUUID } from 'crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IVideoChunk, Task } from '@stombie/retube-core';
import { connect as amqpConnect, ConfirmChannel, Connection, Message } from 'amqplib';

const MAX_CHUNK_LENGTH = 4096;

@Injectable()
export class ChunkExchangeService implements OnModuleInit { 
    private readonly logger = new Logger(ChunkExchangeService.name);
    private readonly amqpConnectionString: string;
    private readonly chunkUploadExchange: string;
    private readonly chunkUploadQueue: string;
    private readonly chunkReplyQueue: string;
    private readonly taskByCorrelationId: Record<string, Task>;

    private initPromise: Promise<void> | null = null;
    private connection: Maybe<Connection>;
    private channel: Maybe<ConfirmChannel>;

    constructor(configService: ConfigService) {
        this.amqpConnectionString = configService.get<string>('amqp.connectionString', 'amqp://localhost');
        this.chunkUploadExchange = configService.get<string>('amqp.chunkUploadExchange', 'chunk-exchange');
        this.chunkUploadQueue = configService.get<string>('amqp.chunkUploadQueue', 'chunk-upload');
        this.chunkReplyQueue = configService.get<string>('amqp.chunkReplyQueue', 'chunk-reply');
        this.taskByCorrelationId = {};
    }

    onModuleInit() {
        if (!this.initPromise) {
            this.initPromise = this.init();
        }

        return this.initPromise;
    }

    push({ sessionId, content, startByte, size }: IVideoChunk): Promise<void> {
        const chunkId = randomUUID();
        const headers = {
            'x-session-id': sessionId,
            'x-start-byte': startByte,
            'x-size': size,
            'x-correlation-id': chunkId,
        };

        const routingKey = `chunk.${chunkId}`;

        return new Promise((resolve, reject) => {
            this.channel.publish(
                this.chunkUploadExchange,
                routingKey,
                content,
                { headers },
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.taskByCorrelationId[chunkId] = { resolve, reject };
                }
            );
        });
    }

    private async init() {
        this.connection = await amqpConnect(this.amqpConnectionString);
        this.channel = await this.connection.createConfirmChannel();
        await Promise.all([
            this.channel.assertExchange(this.chunkUploadExchange, 'topic', { durable: false }),
            this.channel.assertQueue(this.chunkUploadQueue, { durable: false }),
            this.channel.assertQueue(this.chunkReplyQueue, { durable: false }),
        ]);
        await this.channel.bindQueue(this.chunkUploadQueue, this.chunkUploadExchange, 'chunk.*');
        this.channel.consume(this.chunkReplyQueue, this.handleReply);
    }

    private handleReply = (message: Message) => {
        this.channel.ack(message);
        const { headers } = message.properties;
        if (!headers ||
            typeof headers['x-correlation-id'] !== 'string' ||
            typeof headers['x-status'] !== 'string' ||
            (headers['x-status'] !== 'ack' &&
            headers['x-status'] !== 'nack')) {
            return;
        }
        const correlationId = headers['x-correlation-id'];
        if (!this.taskByCorrelationId[correlationId]) {
            return;
        }
        const task = this.taskByCorrelationId[correlationId];
        delete this.taskByCorrelationId[correlationId];
        if (headers['x-status'] === 'ack') {
            task.resolve();
            return;
        }
        const error = headers['x-error'];
        if (typeof error === 'string') {
            task.reject(new Error(error));
            return;
        }
        task.reject(new Error(`Chunk ${correlationId} rejected with no reason`));
    }
}
