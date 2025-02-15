import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VideoState {
    title: string;
    description: string;
}

const initialState = {
    title: '',
    description: '',
} as VideoState;

const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        updateTitle(state, action: PayloadAction<string>) {
            state.title = action.payload;
        },

        updateDescription(state, action: PayloadAction<string>) {
            state.description = action.payload;
        },
    }
});

export const { updateTitle, updateDescription } = videoSlice.actions;
export const videoReducer = videoSlice.reducer;
