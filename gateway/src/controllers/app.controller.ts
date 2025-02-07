import { AppService } from '@/services/app.service';
import { AuthGuard } from '@/services/auth.guard';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Gateway } from '@stombie/retube-core';
import { Request } from 'express';

@Controller()
export class AppController {
    constructor(private readonly app: AppService) {
    }

    @UseGuards(AuthGuard)
    @Post('create-video')
    async createVideo(@Req() request: Request,
                      @Body() { title, description, duration, totalBytesList }: Gateway.Request.CreateVideo) {
        const { user } = request;
        return this.app.createVideo({
            title,
            description,
            duration,
            totalBytesList,
        }, user);
    }
}
