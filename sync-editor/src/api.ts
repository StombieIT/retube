import axios from 'axios';
import { selectAccessToken, selectRefreshToken } from './store/auth/selectors';
import { store } from './store';
import { updateTokens } from './store/auth/slice';
import { Gateway } from '@stombie/retube-core';

const { VITE_GATEWAY_URL } = import.meta.env;

const api = axios.create({
    baseURL: VITE_GATEWAY_URL,
});

api.interceptors.request.use(
    (config) => {
        const accessToken = selectAccessToken(store.getState());

        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }

        return config;
    },
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401) {
            originalRequest._retry = true;
            try {
                const refreshToken = selectRefreshToken(store.getState());
                const { data } = await axios.post<Gateway.Response.Refresh>(`${VITE_GATEWAY_URL}/auth/refresh`, {
                    refreshToken,
                });
                const { payload: tokens } = data;
                store.dispatch(updateTokens(tokens));
                const accessToken = selectAccessToken(store.getState());
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    },
);

export default api;
