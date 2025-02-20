import { Gateway } from '@stombie/retube-core';

export type DistributedFlow =
    Pick<Gateway.SmallFlow, 'id'> &
    Required<Pick<Gateway.SmallFlow, 'distributionUrls'>>;

export type DistributedVideo = Pick<Gateway.SmallVideo, 'id' | 'title' | 'description' | 'uploadedAt'>;
