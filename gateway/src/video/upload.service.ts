import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import * as amqplib from 'amqplib/callback_api';
import { IVideoChunk, VideoId } from '@stombie/retube-core';

const {
    AMQP_CONNECTION_STRING = 'amqp://guest:guest@localhost:5672',
    AMQP_VIDEO_UPLOAD_QUEUE = 'video-upload'
} = process.env;

console.log('br', amqplib);
amqplib.connect(AMQP_CONNECTION_STRING, (res, err) => {
    console.log('got some res');
});

@Injectable()
export class UploadService implements OnModuleInit, OnModuleDestroy {
    private connection: Connection; 
    private channel: Channel;

    async onModuleInit() {
        console.log('bfre');
        this.connection = await connect(AMQP_CONNECTION_STRING);
        console.log('attempting');
        this.channel = await this.connection.createChannel();
        
        // Очередь не является устойчивой (при перезапуске инфомарция сотрётся)
        await this.channel.assertQueue(AMQP_VIDEO_UPLOAD_QUEUE, { durable: false });
        console.log('connect upload');
    }

    async onModuleDestroy() {
        await this.channel.close();
        await this.connection.close();
    }

    queueChunkUpload(chunk: IVideoChunk) {
        const success = this.channel.sendToQueue(
            AMQP_VIDEO_UPLOAD_QUEUE,
            /* Сериализуем данные перед отправкой, так как протокол
               AMQP ожидает в качестве данных последовательность байт */
            Buffer.from(JSON.stringify(chunk)),
            { persistent: true } // При перезапуске приложения сообщение в очереди будет сохраняться
        );

        if (!success) {
            throw new Error(`Failed to publish chunk of video with id ${chunk.id} and start byte ${chunk.startByte}`);
        }
    }
}