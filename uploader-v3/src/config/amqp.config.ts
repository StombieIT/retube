import { registerAs } from '@nestjs/config';

export const AmqpConfig = registerAs('amqp', () => ({
    connectionString: process.env.AMQP_CONNECTION_STRING,
    chunkUploadExchange: process.env.CHUNK_UPLOAD_AMQP_EXCHANGE,
    chunkUploadQueue: process.env.CHUNK_UPLOAD_AMQP_QUEUE,
    chunkReplyQueue: process.env.CHUNK_REPLY_AMQP_QUEUE,
}));
