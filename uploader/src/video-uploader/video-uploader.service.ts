import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { connect, Connection, Channel, ConsumeMessage } from "amqplib";

const {
    AMQP_CONNECTION_STRING = 'amqp://localhost',
    AMQP_UPLOAD_QUEUE = 'video-upload'
} = process.env;

@Injectable()
export class VideoUploaderService implements OnModuleInit, OnModuleDestroy {
    private connection: Connection; 
    private channel: Channel;

    async onModuleInit() {
        this.connection = await connect(AMQP_CONNECTION_STRING);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(AMQP_UPLOAD_QUEUE, { durable: false });

        this.channel.consume(AMQP_UPLOAD_QUEUE, this.handleMessage, { noAck: false });
    }

    async onModuleDestroy() {
        await this.channel.close();
        await this.connection.close();
    }

    protected handleMessage(msg: ConsumeMessage | null) {
        if (msg) {
            const messageContent = msg.content.toString();
        }
    }
}