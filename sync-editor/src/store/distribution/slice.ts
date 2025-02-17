import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DistributionState {
    playerUrl: string;
}

const initialState: DistributionState = {
    playerUrl: '',
};

const distributionSlice = createSlice({
    name: 'distribution',
    initialState,
    reducers: {
        setPlayerUrl(state, action: PayloadAction<string>) {
            state.playerUrl = action.payload;
        },
    },
});

export const { setPlayerUrl } = distributionSlice.actions;
export const distributionReducer = distributionSlice.reducer;
