import http from 'k6/http';
import { JSON_HEADERS } from './constants.js';

const {
    USER_EMAIL,
    USER_PASSWORD,
    BASE_GATEWAY_URL,
} = __ENV;

if (!USER_EMAIL) {
    throw new Error('User email is not presented');
}

if (!USER_PASSWORD) {
    throw new Error('User password is not presented');
}

export function auth() {
    const loginPayload = JSON.stringify({
        email: USER_EMAIL,
        password: USER_PASSWORD,
    });
    
    const res = http.post(`${BASE_GATEWAY_URL}/auth/login`, loginPayload, { headers: JSON_HEADERS });
    
    const { payload: { accessToken } } = res.json();

    return accessToken;
}
