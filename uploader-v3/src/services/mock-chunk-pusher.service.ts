import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect as amqpConnect, Channel, Connection, ConsumeMessage } from 'amqplib';

@Injectable()
export class MockChunkPusher implements OnModuleInit { 
    private readonly amqpConnectionString: string;
    private readonly queue: string;

    private connection: Maybe<Connection>;
    private channel: Maybe<Channel>;

    constructor(configService: ConfigService) {
        this.amqpConnectionString = configService.get<string>('AMQP_CONNECTION_STRING', 'amqp://localhost');
        this.queue = configService.get<string>('CHUNK_UPLOAD_AMQP_QUEUE', 'chunk-upload');
    }

    async onModuleInit() {
        this.connection = await amqpConnect(this.amqpConnectionString);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(this.queue);

        this.initPushing();
    }
    
    initPushing() {
        setTimeout(() => {
            const headers = {
                'x-upload-session-id': String(Math.floor(Math.random() * 1000)),
                'x-start-byte': Math.floor(Math.random() * 1000),
                'x-size': Date.now(),
            };
            this.channel.sendToQueue(this.queue, Buffer.from('bred'), { headers, messageId: String(Date.now()) });
            this.initPushing();
        }, 3000);
    }
}
