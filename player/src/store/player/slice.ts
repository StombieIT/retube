import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlayerStatus } from '../../types/player';
import { SetTimePayload } from './types';

interface PlayerState {
    status: PlayerStatus;
    currentTime: number;
    duration: number;
}

const initialState: PlayerState = {
    status: PlayerStatus.PAUSED,
    currentTime: 0,
    duration: 0,
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setStatus(state, action: PayloadAction<PlayerStatus>) {
            state.status = action.payload;
        },

        setCurrentTime(state, action: PayloadAction<number>) {
            state.currentTime = action.payload;
        },

        setDuration(state, action: PayloadAction<number>) {
            state.duration = action.payload;
        },
    },
});

export const playerReducer = playerSlice.reducer;
export const { setStatus, setCurrentTime, setDuration } = playerSlice.actions;
export const setTime = createAction<SetTimePayload>('player/setTime');