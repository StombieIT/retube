import { all, call, put, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { addCandidateVideoAction, deleteCandidateByIdAction, deleteFlowById } from './slice';
import { videoManager } from '../../managers/video-manager/manager';
import { AddCandidateVideoPayload } from './types';

function* addCandidateVideoSaga({ payload: { candidateId, video } }: PayloadAction<AddCandidateVideoPayload>) {
    yield call([videoManager, videoManager.addVideo], candidateId, video);
}

function* deleteCandidateByIdSaga({ payload: id }: PayloadAction<string>) {
    yield put(deleteFlowById(id));
    yield call([videoManager, videoManager.removeVideoById], id);
}

export function* flowCandidatesRootSaga() {
    yield all([
        takeEvery(deleteCandidateByIdAction.type, deleteCandidateByIdSaga),
        takeEvery(addCandidateVideoAction.type, addCandidateVideoSaga),
    ]);
}
