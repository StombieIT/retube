import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { User, Video, Flow, UploadSession } from '@stombie/retube-core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChunkConsumerService } from './services/chunk-consumer.service';
import { ApiService } from './services/api.service';
import { FFlowCacheService } from './services/fflow-cache.service';
import { AmqpConfig } from './config/amqp.config';
import { ApiConfig } from './config/api.config';
import { RedisConfig } from './config/redis.config';
import { AppService } from './services/app.service';
import { FtpConfig } from './config/ftp.config';
import { FFlowOrchestratorService } from './services/fflow-orchestrator.service';

const DB_ENTITIES = [User, Video, Flow, UploadSession];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_CONNECTION_STRING ?? 'postgresql://postgres:postgres@localhost:5432/retube',
      entities: DB_ENTITIES,
    }),
    TypeOrmModule.forFeature(DB_ENTITIES),
      ConfigModule.forRoot({
        isGlobal: true,
        load: [AmqpConfig, ApiConfig, RedisConfig, FtpConfig],
      }),
      HttpModule,
  ],
  providers: [ChunkConsumerService, ApiService, FFlowCacheService, FFlowOrchestratorService, AppService],
})
export class AppModule {}
