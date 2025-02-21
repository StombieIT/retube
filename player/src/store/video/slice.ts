import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DistributedFlow, DistributedVideo } from './types'

export interface VideoState extends Omit<DistributedVideo, 'id' | 'uploadedAt'> {
    id: string | null;
    mainFlowId: string | null;
    flowIds: string[];
    flowById: Record<string, DistributedFlow>;
    uploadedAt: number | null;
}

const initialState: VideoState = {
    id: null,
    mainFlowId: null,
    title: '',
    description: '',
    flowIds: [],
    flowById: {},
    uploadedAt: null,
};

const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        updateFlows(state, { payload }: PayloadAction<DistributedFlow | DistributedFlow[]>) {
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

        setTitle(state, action: PayloadAction<string>) {
            state.title = action.payload;
        },

        setDescription(state, action: PayloadAction<string>) {
            state.description = action.payload;
        },

        setId(state, action: PayloadAction<string | null>) {
            state.id = action.payload;
        },

        setUploadedAt(state, action: PayloadAction<number | null>) {
            state.uploadedAt = action.payload;
        },

        setMainFlowId(state, action: PayloadAction<string | null>) {
            state.mainFlowId = action.payload;
        },
    },
});

export const { updateFlows, setTitle, setDescription, setId, setUploadedAt, setMainFlowId } = videoSlice.actions;
export const videoReducer = videoSlice.reducer;
