import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Stage } from '../../types/app';

const initialState = Stage.SYNCHRONIZING;

const stageSlice = createSlice({
    name: 'stage',
    initialState,
    reducers: {
        changeStage: (state, action: PayloadAction<Stage>) => {
            return action.payload;
        },
    },
});

export const { changeStage } = stageSlice.actions;
export const stageReducer = stageSlice.reducer;
