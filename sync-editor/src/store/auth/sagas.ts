import { takeLatest, call, fork, put, all } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { Gateway } from '@stombie/retube-core';
import api from '../../api';
import { login, logout, register, reset, updateTokens } from './slice';
import { AuthCredentials, isOAuthTokens, UpdateTokensPayload } from './types';

const {
    VITE_TOKENS_STORAGE_KEY = '_tokens',
} = import.meta.env;

function* authInit() {
    const tokensStringified: string | null = yield call([localStorage, localStorage.getItem], VITE_TOKENS_STORAGE_KEY);
    if (!tokensStringified) {
        return;
    }
    let tokens: UpdateTokensPayload;
    try {
        const tokensObj = JSON.parse(tokensStringified);
        if (!isOAuthTokens(tokensObj)) {
            throw new Error('Invalid tokens value in storage');
        }
        tokens = tokensObj;
    } catch (err) {
        return;
    }
    yield put(updateTokens(tokens));

    try {
        yield call(api.get, '/me');
    } catch (error) {
        yield put(reset());
    }
}

function* loginSaga(action: PayloadAction<AuthCredentials>) {
    try {
        const { data: { payload: tokens }, }: AxiosResponse<Gateway.Response.Login>
            = yield call(api.post, `/auth/login`, action.payload);
        const tokensStringified = JSON.stringify(tokens);
        yield call([localStorage, localStorage.setItem], VITE_TOKENS_STORAGE_KEY, tokensStringified);
        yield put(updateTokens(tokens));
    } catch (error) {
        // ignore
    }
}

function* logoutSaga() {
    yield call([localStorage, localStorage.removeItem], VITE_TOKENS_STORAGE_KEY);
    yield put(reset());
}

function* registerSaga(action: PayloadAction<AuthCredentials>) {
    try {
        yield call(api.post, '/auth/register', action.payload);
    } catch (error) {
        // ignore
        // TODO: add notification
    }
}

export function* authRootSaga() {
    yield all([
        fork(authInit),
        takeLatest(login.type, loginSaga),
        takeLatest(register.type, registerSaga),
        takeLatest(logout.type, logoutSaga),
    ]);
}
