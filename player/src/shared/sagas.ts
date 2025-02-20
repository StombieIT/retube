import { all, call, fork, put } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import { Gateway } from '@stombie/retube-core';
import { api } from '../api';
import { setDescription, setId, setTitle, setUploadedAt, updateFlows } from '../store/video/slice';
import { DistributedFlow } from '../store/video/types';
import { setErrorType } from '../store/error/slice';
import { ErrorType } from '../types/error-type';

function* fillContent() {
    try {
        const videoId = window.location.pathname;

        const { data: { payload } }: AxiosResponse<Gateway.Response.State> =
            yield call(api.get, `/state/${videoId}`);
        const { id, title, description, flows, status, uploadedAt } = payload;

        if (status !== 'DISTRIBUTED') {
            yield put(setErrorType(ErrorType.VIDEO_NOT_DISTRIBUTED));
            return;
        }

        yield all([
            put(setId(id)),
            put(setTitle(title)),
            put(setDescription(description)),
            put(updateFlows(flows as DistributedFlow[])),
            put(setUploadedAt(uploadedAt || null)),
        ]);
    } catch (error) {
        // @ts-ignore
        // TODO: добавить error
    }
}

export function* sharedRootSaga() {
    yield all([
        fork(fillContent),
    ]);
}