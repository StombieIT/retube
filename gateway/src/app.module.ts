import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@stombie/retube-core';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './services/app.service';
import { AmqpConfig } from './config/amqp.config';
import { MockChunkPusherService } from './services/mock-chunk-pusher.service';

const DB_ENTITIES = [User];

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DB_CONNECTION_STRING ?? 'postgresql://postgres:postgres@localhost:5432/retube',
            synchronize: true, // TODO: add env checking
            entities: DB_ENTITIES,
        }),
        TypeOrmModule.forFeature(DB_ENTITIES),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [AmqpConfig]
        }),
    ],
    providers: [AppService, MockChunkPusherService],
})
export class AppModule {}
