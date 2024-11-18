import { Module } from "@nestjs/common";
import { VideoUploaderModule } from './video-uploader/video-uploader.module';
@Module({
  imports: [VideoUploaderModule]
})
export class AppModule {}
