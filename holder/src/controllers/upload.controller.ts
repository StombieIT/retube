import * as fs from 'fs/promises';
import { Controller, Post, Delete, Body, HttpException, HttpStatus, Param } from '@nestjs/common';
import { Holder, UploadSessionId } from '@stombie/retube-core';
import { PathService } from '../services/path.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly pathService: PathService) {}

    @Post('register/:uploadSessionId')
    async register(
        @Body() body: Holder.Upload.Request.Register,
        @Param('uploadSessionId') uploadSessionId: UploadSessionId,
    ) {
        const { formats } = body;

        if (!uploadSessionId || !formats || formats.length === 0) {
            throw new HttpException('Invalid input: uploadSessionId and formats are required.', HttpStatus.BAD_REQUEST);
        }

        try {
            for (const format of formats) {
                const folderPath = this.pathService.fflowDir(uploadSessionId, format);
                await fs.mkdir(folderPath, { recursive: true });
                console.log(`Created folder: ${folderPath}`);
            }

            return { message: 'Folders created successfully.' };
        } catch (error) {
            throw new HttpException(
                `Error while creating folders: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete('unregister/:uploadSessionId')
    async unregister(
        @Param('uploadSessionId') uploadSessionId: UploadSessionId,
    ) {
        if (!uploadSessionId) {
            throw new HttpException('Invalid input: uploadSessionId is required.', HttpStatus.BAD_REQUEST);
        }

        try {
            const folderPath = this.pathService.fflowDir(uploadSessionId);
            await fs.rm(folderPath, { recursive: true, force: true });
            console.log(`Deleted folder: ${folderPath}`);

            return { message: 'Folder deleted successfully.' };
        } catch (error) {
            throw new HttpException(
                `Error while deleting folder: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
