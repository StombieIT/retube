import axios from 'axios';
import { selectAccessToken } from './store/auth/selectors';
import { store } from './store';

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
    }
);

export default api;
