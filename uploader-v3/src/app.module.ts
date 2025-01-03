import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ChunkConsumerService } from './services/chunk-consumer.service';
import { MockChunkPusher } from './services/mock-chunk-pusher.service';
import { ApiService } from './services/api.service';
import { FFlowCacheService } from './services/fflow-cache.service';
import { FFmpegProcessorService } from './services/ffmpeg-processor.service';
import { AmqpConfig } from './config/amqp.config';
import { ApiConfig } from './config/api.config';
import { FFmpegConfig } from './config/ffmpeg.config';
import { RedisConfig } from './config/redis.config';
import { AppService } from './services/app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AmqpConfig, ApiConfig, FFmpegConfig, RedisConfig]
    }),
    HttpModule,
  ],
  providers: [ChunkConsumerService, ApiService, FFlowCacheService, FFmpegProcessorService, MockChunkPusher, AppService],
})
export class AppModule {}
