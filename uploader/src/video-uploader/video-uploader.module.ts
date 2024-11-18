import { Module } from "@nestjs/common";
import { VideoUploaderService } from "./video-uploader.service";

@Module({
    providers: [VideoUploaderService],
    exports: [VideoUploaderService]
})
export class VideoUploaderModule {}