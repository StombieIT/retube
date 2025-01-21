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
import { RedisConfig } from './config/redis.config';
import { AppService } from './services/app.service';
import { FtpConfig } from './config/ftp.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AmqpConfig, ApiConfig, RedisConfig, FtpConfig],
    }),
    HttpModule,
  ],
  providers: [ChunkConsumerService, ApiService, FFlowCacheService, FFmpegProcessorService, AppService],
})
export class AppModule {}
