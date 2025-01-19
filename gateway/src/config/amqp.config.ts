import { registerAs } from '@nestjs/config';

export const AmqpConfig = registerAs('amqp', () => ({
    connectionString: process.env.AMQP_CONNECTION_STRING,
    chunkUploadQueue: process.env.CHUNK_UPLOAD_AMQP_QUEUE,
}));
