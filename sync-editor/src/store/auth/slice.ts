import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthCredentials, OAuthTokens, UpdateTokensPayload } from './types';

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

export const login = createAction<AuthCredentials>('auth/login');
export const register = createAction<AuthCredentials>('auth/register');
export const { updateTokens, reset } = authSlice.actions;
export const authReducer = authSlice.reducer;
