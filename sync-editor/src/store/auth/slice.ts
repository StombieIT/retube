import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OAuthTokens, UpdateTokensPayload } from './types';

export type AuthState = OAuthTokens | null;

const initialState = null as AuthState;

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateTokens: (state, action: PayloadAction<UpdateTokensPayload>) => {
            const { refreshToken, accessToken } = action.payload
            if (refreshToken && accessToken && !state) {
                return { refreshToken, accessToken };
            }
            if (state) {
                state.accessToken = accessToken ?? state.accessToken;
                state.refreshToken = refreshToken ?? state.refreshToken;
            }
        },

        reset: () => {
            return null;
        }
    },
});

export const { updateTokens, reset } = authSlice.actions;
export const authReducer = authSlice.reducer;
