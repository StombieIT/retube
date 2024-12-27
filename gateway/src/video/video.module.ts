import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { MockUploadService } from './mock-upload.service';

@Module({
  providers: [UploadService, MockUploadService]
})
export class VideoModule {}