import { RootState } from '../types';

export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth);
export const selectAccessToken = (state: RootState) => state.auth?.accessToken;
