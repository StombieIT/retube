import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorType } from '../../types/error-type';

export interface ErrorState {
    type: ErrorType | null;
}

const initialState: ErrorState = {
    type: null,
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setErrorType(state, action: PayloadAction<ErrorType | null>) {
            state.type = action.payload;
        },
    },
});

export const { setErrorType } = errorSlice.actions;
export const errorReducer = errorSlice.reducer;
