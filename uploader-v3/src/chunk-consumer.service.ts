import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect as amqpConnect, Channel, Connection, ConsumeMessage, Message } from 'amqplib';
import { IVideoChunk } from '@stombie/retube-core';
import * as EventEmitter from 'node:events';

interface ChunkConsumerEventMap {
    chunk: any[];
}

@Injectable()
export class ChunkConsumer extends EventEmitter<ChunkConsumerEventMap> implements OnModuleInit { 
    private readonly amqpConnectionString: string;
    private readonly queue: string;
    private readonly preconsumedMessageById: Record<string, Message>;

    private connection: Maybe<Connection>;
    private channel: Maybe<Channel>;

    constructor(configService: ConfigService) {
        super();
        this.amqpConnectionString = configService.get<string>('AMQP_CONNECTION_STRING', 'amqp://localhost');
        this.queue = configService.get<string>('CHUNK_UPLOAD_AMQP_QUEUE', 'chunk-upload');
        this.preconsumedMessageById = {};
    }

    async onModuleInit() {
        this.connection = await amqpConnect(this.amqpConnectionString);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(this.queue);

        this.channel.consume(this.queue, this.handleMessage, {
            noAck: true
        });
    }

    dropMessageById(messageId?: string) {
        if (!messageId || !this.preconsumedMessageById[messageId]) {
            return;
        }
        const message = this.preconsumedMessageById[messageId];
        this.rejectMessage(message);
        delete this.preconsumedMessageById[messageId];
    }

    private handleMessage = (message: ConsumeMessage | null) => {
        if (!message) {
            return this.rejectMessage(message);
        }

        const { content, properties } = message;
        const { headers, messageId } = properties;
        // Валидация сообщения
        if (typeof headers['x-upload-session-id'] !== 'string' ||
            typeof headers['x-start-byte'] !== 'number' ||
            typeof headers['x-size'] !== 'number') {
            return this.rejectMessage(message);
        }
        if (messageId) {
            this.preconsumedMessageById[messageId] = message;
        }

        const chunk: IVideoChunk = {
            sessionId: headers['x-upload-session-id'],
            startByte: headers['x-start-byte'],
            size: headers['x-size'],
            content
        };
        this.emit('chunk', messageId, chunk);
    }

    private rejectMessage(message: Message, requeue: boolean = false) {
        this.channel.nack(message, false, requeue);
    }
}
