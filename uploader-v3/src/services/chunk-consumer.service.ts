import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect as amqpConnect, ConfirmChannel, Connection, ConsumeMessage } from 'amqplib';
import { IVideoChunk } from '@stombie/retube-core';
import * as EventEmitter from 'node:events';

const EMPTY_CONTENT = Buffer.alloc(0);

interface ChunkConsumerServiceEventMap {
    chunk: any[];
}

@Injectable()
export class ChunkConsumerService extends EventEmitter<ChunkConsumerServiceEventMap> implements OnModuleInit { 
    private readonly logger = new Logger(ChunkConsumerService.name);
    private readonly amqpConnectionString: string;
    private readonly chunkUploadExchange: string;
    private readonly chunkUploadQueue: string;
    private readonly chunkReplyQueue: string;
    private readonly preconsumedMessagesCorrelationIds: Set<string>;

    private initPromise: Promise<void> | null = null;
    private connection: Maybe<Connection>;
    private channel: Maybe<ConfirmChannel>;

    constructor(configService: ConfigService) {
        super();
        this.amqpConnectionString = configService.get<string>('amqp.connectionString', 'amqp://localhost');
        this.chunkUploadExchange = configService.get<string>('amqp.chunkUploadExchange', 'chunk-exchange');
        this.chunkUploadQueue = configService.get<string>('amqp.chunkUploadQueue', 'chunk-upload');
        this.chunkReplyQueue = configService.get<string>('amqp.chunkReplyQueue', 'chunk-reply');
        this.preconsumedMessagesCorrelationIds = new Set();
    }

    onModuleInit() {
        if (!this.initPromise) {
            this.initPromise = this.init();
        }

        return this.initPromise;
    }

    private async init() {
        this.connection = await amqpConnect(this.amqpConnectionString);
        this.channel = await this.connection.createConfirmChannel();
        await Promise.all([
            this.channel.assertExchange(this.chunkUploadExchange, 'topic', { durable: false }),
            this.channel.assertQueue(this.chunkUploadQueue, { durable: false }),
            this.channel.assertQueue(this.chunkReplyQueue, { durable: false }),
        ]);
        await this.channel.bindQueue(this.chunkReplyQueue, this.chunkUploadExchange, 'reply.*');
        this.channel.consume(this.chunkUploadQueue, this.handleMessage);
    }

    acceptMessageByCorrelationId(correlationId: string) {
        this.logger.log(`Accepted message: ${correlationId}`);
        return this.replyMessage(correlationId, 'ack');
    }

    dropMessageByCorrelationId(correlationId: string, error?: string) {
        this.logger.log(`Dropped message: ${correlationId} - ${error}`);
        return this.replyMessage(correlationId, 'nack', error);
    }

    private replyMessage(correlationId: string, status: 'ack' | 'nack', error?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.preconsumedMessagesCorrelationIds.has(correlationId)) {
                reject(new Error(`No message with correlationId ${correlationId} found`));
            }
            const headers = {
                'x-correlation-id': correlationId,
                'x-status': status,
                'x-error': error,
            };
            const routingKey = `reply.${correlationId}`;
            this.channel.publish(
                this.chunkUploadExchange,
                routingKey,
                EMPTY_CONTENT,
                { headers },
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.preconsumedMessagesCorrelationIds.delete(correlationId);
                    resolve();
                }
            );
        });
    }

    private handleMessage = (message: ConsumeMessage | null) => {
        if (!message) {
            return this.channel.nack(message);
        }

        const { content, properties } = message;
        const { headers } = properties;
        // Валидация сообщения
        if (typeof headers['x-session-id'] !== 'string' ||
            typeof headers['x-correlation-id'] !== 'string' ||
            typeof headers['x-start-byte'] !== 'number' ||
            typeof headers['x-size'] !== 'number') {
            return this.channel.nack(message);
        }
        this.channel.ack(message);
        const correlationId = headers['x-correlation-id'];
        this.preconsumedMessagesCorrelationIds.add(correlationId);
        const chunk: IVideoChunk = {
            sessionId: headers['x-session-id'],
            startByte: headers['x-start-byte'],
            size: headers['x-size'],
            content,
        };
        this.emit('chunk', correlationId, chunk);
    }
}
