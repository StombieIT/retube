import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SetCanPlayPayload } from './types';

interface SlotControlState {
    toSeek: number | null;
    toPlay: boolean | null;
    toVolume: number | null;
    canPlayByFlowId: Record<string, boolean>;
}

const initialState: SlotControlState = {
    toSeek: null,
    toPlay: null,
    toVolume: null,
    canPlayByFlowId: {},
};

const slotControl = createSlice({
    name: 'slotControl',
    initialState,
    reducers: {
        setToSeek(state, action: PayloadAction<number | null>) {
            state.toSeek = action.payload;
        },

        setToPlay(state, action: PayloadAction<boolean | null>) {
            state.toPlay = action.payload;
        },

        setToVolume(state, action: PayloadAction<number | null>) {
            state.toVolume = action.payload;
        },

        setCanPlay(state, action: PayloadAction<SetCanPlayPayload>) {
            const { flowId, canPlay } = action.payload;
            state.canPlayByFlowId[flowId] = canPlay;
        },
    },
});

export const slotControlReducer = slotControl.reducer;
export const { setToSeek, setToPlay, setToVolume, setCanPlay } = slotControl.actions;
