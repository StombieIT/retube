import { Injectable } from '@nestjs/common';
import { Gateway, Video } from '@stombie/retube-core';
import { FlowConverterService } from './flow.converter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VideoConverterService {
    private readonly holderBaseUrl: string; 
    private readonly manifestName: string;

    constructor(configService: ConfigService,
                private readonly flowConverter: FlowConverterService) {
        this.holderBaseUrl = configService.get<string>('holder.baseUrl', 'http://localhost:4050');
        this.manifestName = configService.get<string>('holder.manifestName', 'manifest');
    }
    
    toSmallVideo(video: Video): Gateway.SmallVideo {
        return {
            id: video.id,
            title: video.title,
            description: video.description,
            duration: video.duration,
            status: video.status,
            flows: video.flows.map(flow => {
                const distributionUrls = {
                    dash: `${this.holderBaseUrl}/${video.id}/${flow.id}/dash//${this.manifestName}.mpd`,
                    hls: `${this.holderBaseUrl}/${video.id}/${flow.id}/hls/${this.manifestName}.m3u8`,
                };

                return this.flowConverter.toSmallFlow(flow, distributionUrls);
            }),
        };
    }
}
