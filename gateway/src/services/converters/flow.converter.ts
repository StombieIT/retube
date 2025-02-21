import { Flow, Format, Gateway } from '@stombie/retube-core';
import { Injectable } from '@nestjs/common';
import { UploadSessionConverterService } from './upload-session.converter';

@Injectable()
export class FlowConverterService {
    constructor(private readonly uploadSessionConverter: UploadSessionConverterService) {}
    
    toSmallFlow(flow: Flow, distributionUrls?: Record<Format, string>): Gateway.SmallFlow {
        const smallFlow: Gateway.SmallFlow = {
            id: flow.id,
            status: flow.status,
        };

        if (flow.uploadSession) {
            smallFlow.uploadSession = this.uploadSessionConverter.toSmallUploadSession(flow.uploadSession);
        }

        smallFlow.distributionUrls = distributionUrls;

        return smallFlow;
    }
}
