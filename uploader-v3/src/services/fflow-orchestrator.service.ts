import { Injectable } from '@nestjs/common';
import { ApiService } from './api.service';
import { FFlowCacheService } from './fflow-cache.service';

// TODO: мб вообще не нужен, перенести все в AppService
@Injectable()
export class FFlowOrchestratorService {
    constructor(private readonly api: ApiService,
                private readonly fflowCache: FFlowCacheService) {
    }

    async ensureFlow(uploadSessionId: string): Promise<string> {
        let flowUrl = await this.fflowCache.getFlowUrl(uploadSessionId);
        if (!flowUrl) {
            const { data } = await this.api.createFlow(uploadSessionId);
            const { flowUrl: createdFlowUrl } = data;
            await this.fflowCache.addFlowUrl(uploadSessionId, createdFlowUrl);
            flowUrl = createdFlowUrl;
        }
        return flowUrl;
    }

    async pushToFlow(uploadSessionId: string, content: Buffer) {
        const flowUrl = await this.ensureFlow(uploadSessionId);
        await this.api.pushToFlow(`${flowUrl}/push`, content);
    }

    async finishFlow(uploadSessionId: string) {
        const flowUrl = await this.ensureFlow(uploadSessionId);
        await this.api.finishFlow(`${flowUrl}/finish`);
        await this.fflowCache.deleteFlowUrl(uploadSessionId);
    }
}
