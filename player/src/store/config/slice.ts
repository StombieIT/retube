import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConfigState {
    isControlsHideable: boolean;
}

const initialState: ConfigState = {
    isControlsHideable: false,
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setIsControlsHideable(state, action: PayloadAction<boolean>) {
            state.isControlsHideable = action.payload;
        },     
    },
});

export const configReducer = configSlice.reducer;
export const { setIsControlsHideable } = configSlice.actions;
