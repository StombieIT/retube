import { Injectable, OnModuleInit } from "@nestjs/common";
import { UploadService } from "./upload.service";
import * as path from "path";
import * as fs from "fs/promises";

@Injectable()
export class MockUploadService implements OnModuleInit {
    constructor(private readonly uploadService: UploadService) {}

    async onModuleInit() {
        console.log('initting mock');
        const buffer = await fs.readFile('/Users/vladislav.yartsev/Desktop/dev/personal/retube/gateway/src/video/test-video.mp4');
        console.log('here');
        this.uploadService.queueChunkUpload({
            id: 'bredik',
            content: buffer,
            startByte: 0,
            size: buffer.length
        });
    }
}