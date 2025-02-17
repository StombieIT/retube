import { Gateway } from '@stombie/retube-core';

export type UploadingFlow = Gateway.SmallFlow;

export enum CommonStatus {
    CREATED = 'CREATED',
    UPLOADING = 'UPLOADING',
    DISTRIBUTED = 'DISTRIBUTED',
    BLOCKED = 'BLOCKED',
}

