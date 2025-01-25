import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiService } from './api.service';
import { FFlowCacheService } from './fflow-cache.service';

// TODO: мб вообще не нужен, перенести все в AppService
@Injectable()
export class FFmpegProcessorService {
    private readonly holderUrl: string;

    constructor(private readonly api: ApiService,
                private readonly fflowCache: FFlowCacheService,
                configService: ConfigService) {
        this.holderUrl = configService.get<string>('ftp.holderUrl', 'ftp://localhost:21');
    }

    // TODO: добавить отдельный класс для работы с флоу
    async pushToFlow(uploadSessionId: string, buffer: Buffer) {
        let flowUrl: string;
        const flowExists = await this.fflowCache.isFlowExists(uploadSessionId);
        if (flowExists) {
            const cachedFlowUrl = await this.fflowCache.getFlowUrl(uploadSessionId);
            if (!cachedFlowUrl) {
                throw new Error('pushToFlow: No flow url got from fflow cache');
            }
            flowUrl = cachedFlowUrl;
        } else {
            const { data } = await this.api.createFlow(uploadSessionId);
            flowUrl = data.flowUrl;
            await this.fflowCache.addFlowUrl(uploadSessionId, flowUrl);
        }
        const pushUrl = `${flowUrl}/push`;
        await this.api.pushToFlow(pushUrl, buffer);
    }

    async finishFlow(uploadSessionId: string) {
        const flowExists = await this.fflowCache.isFlowExists(uploadSessionId);
        if (!flowExists) {
            throw new Error(`finishFlow: No flow with uploadSessionId ${uploadSessionId} found`);
        }
        const flowUrl = await this.fflowCache.getFlowUrl(uploadSessionId);
        const finishUrl = `${flowUrl}/finish`;
        await this.api.finishFlow(finishUrl);
        await this.fflowCache.deleteFlowUrl(uploadSessionId);
    }
}
