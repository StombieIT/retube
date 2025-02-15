import { call, put } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import { Gateway } from '@stombie/retube-core';
import { updateTokens } from './slice';
import api from '../../api';

const AUTH_CREDENTIALS = {
    email: '12bredik@asass.ru',
    password: 'aga',
};

export function* authRootSaga() {
    const { data: { payload: tokens } }: AxiosResponse<Gateway.Response.Login> = yield call(api.post, '/auth/login', AUTH_CREDENTIALS);
    yield put(updateTokens(tokens!));
}
