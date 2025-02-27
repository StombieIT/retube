import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlayerStatus } from '../../types/player';
import { SetTimePayload } from './types';

interface PlayerState {
    status: PlayerStatus;
    currentTime: number;
    duration: number;
    isFullScreenOpened: boolean;
    isMuted: boolean;
    volume: number;
}

const initialState: PlayerState = {
    status: PlayerStatus.PAUSED,
    currentTime: 0,
    duration: 0,
    volume: 50,
    isFullScreenOpened: false,
    isMuted: false,
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

        setVolume(state, action: PayloadAction<number>) {
            state.volume = action.payload;
        },

        setIsFullScreenOpened(state, action: PayloadAction<boolean>) {
            state.isFullScreenOpened = action.payload;
        },

        setIsMuted(state, action: PayloadAction<boolean>) {
            state.isMuted = action.payload;
        },
    },
});

export const playerReducer = playerSlice.reducer;
export const {
    setStatus, setCurrentTime, setDuration,
    setVolume, setIsFullScreenOpened, setIsMuted,
} = playerSlice.actions;
export const setTime = createAction<SetTimePayload>('player/setTime');