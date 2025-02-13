import { AppService } from '@/services/app.service';
import { AuthGuard } from '@/services/auth.guard';
import { Body, Controller, Param, Get, Post, Req, UseGuards, Headers, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Gateway, NoRightsError, NotFoundError } from '@stombie/retube-core';
import { Request } from 'express';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);    

    constructor(private readonly app: AppService) {
    }

    @UseGuards(AuthGuard)
    @Post('create-video')
    async createVideo(@Req() request: Request,
                      @Body() { title, description, duration, totalBytesList }: Gateway.Request.CreateVideo) {
        try {
            const { user } = request;
            return this.app.createVideo({
                title,
                description,
                duration,
                totalBytesList,
            }, user);
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: error.message,
                },
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    @UseGuards(AuthGuard)
    @Post('upload/:sessionId')
    async upload(
        @Req() request: Request,
        @Param('sessionId') sessionId: string,
        @Headers('x-start-byte') startByteHeader: string,
        @Headers('x-size') sizeHeader: string,
        @Body() content: Buffer,
    ): Promise<Gateway.Response.Upload> {
        try {
            const startByte = Number(startByteHeader);
            if (isNaN(startByte)) {
                throw new Error('Start byte is not number');
            }
            const size = Number(sizeHeader);
            if (isNaN(size)) {
                throw new Error('Size is not number');
            }
            const { user } = request;
            await this.app.upload({
                sessionId,
                startByte,
                size,
                content,
            }, user);
            return {
                status: 'success',
                message: 'Chunk is successfully uploaded',
            };
        } catch (error) {
            const status = (() => {
                if (error instanceof NotFoundError) {
                    return HttpStatus.NOT_FOUND;
                }

                if (error instanceof NoRightsError) {
                    return HttpStatus.UNAUTHORIZED;
                }

                return HttpStatus.BAD_REQUEST;
            })();
            throw new HttpException(
                {
                    status: 'error',
                    message: error.message,
                },
                status,
            );
        }
    }

    @Get('state/:videoId')
    async state(@Param('videoId') videoId: string): Promise<Gateway.Response.State> {
        try {
            const state = await this.app.state(videoId);
            return {
                status: 'success',
                payload: state,
            };
        } catch (error) {
            const status = (() => {
                if (error instanceof NotFoundError) {
                    return HttpStatus.NOT_FOUND;
                }

                return HttpStatus.BAD_REQUEST;
            })();
            throw new HttpException(
                {
                    status: 'error',
                    message: error.message,
                },
                status,
            );
        }
    }
}
