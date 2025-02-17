import { RootState } from '../types';
import { UploadingFlow } from './types';

export const selectFlowIds = (state: RootState) => state.upload.flowIds;
export const selectFlowById = (state: RootState) => state.upload.flowById;

export const selectUploadingFlows = (state: RootState) => {
    const flowIds = selectFlowIds(state);
    const flowById = selectFlowById(state);

    const flows = flowIds.reduce((acc, flowId) => {
        if (!flowById[flowId]) {
            return acc;
        }

        acc.push(flowById[flowId]);
        return acc;
    }, [] as UploadingFlow[])
    return flows;
};
