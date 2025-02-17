import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CommonStatus, UploadingFlow } from './types';

export interface UploadState {
    commonStatus?: CommonStatus;
    flowIds: string[];
    flowById: Record<string, UploadingFlow>;
}

const initialState: UploadState = {
    flowIds: [],
    flowById: {},
};

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        updateFlows(state, { payload }: PayloadAction<UploadingFlow | UploadingFlow[]>) {
            const flows = Array.isArray(payload) ? payload : [payload];

            flows.forEach(flow => {
                if (!state.flowIds.includes(flow.id)) {
                    state.flowIds.push(flow.id);
                }

                if (!state.flowById[flow.id]) {
                    const existingFlow = state.flowById[flow.id];
                    state.flowById[flow.id] = {
                        ...existingFlow,
                        ...flow,
                    };
                } else {
                    state.flowById[flow.id] = flow;
                }
            });
        },

        updateCommonStatus(state, { payload }: PayloadAction<CommonStatus>) {
            state.commonStatus = payload;
        },
    },
});

export const { updateFlows, updateCommonStatus } = uploadSlice.actions;
export const uploadReducer = uploadSlice.reducer;
