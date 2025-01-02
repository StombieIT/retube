import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChunkConsumer } from './services/chunk-consumer.service';
import { MockChunkPusher } from './services/mock-chunk-pusher.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    HttpModule,
  ],
  providers: [ChunkConsumer, MockChunkPusher],
})
export class AppModule {}
