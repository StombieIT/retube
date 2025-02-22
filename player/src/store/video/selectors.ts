import { RootState } from '../types';
import { DistributedFlow } from './types';

export const selectFlowById = (flowId: string) => (state: RootState) =>
    state.video.flowById[flowId];

export const selectFlowIds = (state: RootState) => state.video.flowIds;

export const selectFlows = (state: RootState): DistributedFlow[] => {
    const flowIds = state.video.flowIds;

    return flowIds.reduce((flows, flowId) => {
        const flow = state.video.flowById[flowId];
        if (!flow) {
            return flows;
        }

        flows.push(flow);
        return flows;
    }, [] as DistributedFlow[]);
};

export const selectMainFlowId = (state: RootState) =>
    state.video.mainFlowId; 
