import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChunkConsumer } from './chunk-consumer.service';
import { MockChunkPusher } from './mock-chunk-pusher.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [],
  providers: [ChunkConsumer, MockChunkPusher],
})
export class AppModule {}
