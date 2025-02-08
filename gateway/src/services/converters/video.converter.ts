import { Injectable } from '@nestjs/common';
import { Gateway, Video } from '@stombie/retube-core';
import { FlowConverterService } from './flow.converter';

@Injectable()
export class VideoConverterService {
    constructor(private readonly flowConverter: FlowConverterService) {}
    
    toSmallVideo(video: Video): Gateway.SmallVideo {
        return {
            id: video.id,
            title: video.title,
            description: video.description,
            duration: video.duration,
            status: video.status,
            flows: video.flows.map(flow => this.flowConverter.toSmallFlow(flow)),
        };
    }
}
