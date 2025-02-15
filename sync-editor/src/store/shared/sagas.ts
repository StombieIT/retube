import { Gateway } from '@stombie/retube-core';
import { all, call, fork, put, select, takeLatest } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import { startUpload } from './actions';
import { changeStage } from '../stage';
import { Stage } from '../../types/app';
import { selectFlowCandidates } from '../flow-candidates/selectors';
import { videoManager } from '../../managers/video-manager/manager';
import api from '../../api';

const {
    VITE_MAX_CHUNK_SIZE,
} = import.meta.env;

const MAX_CHUNK_SIZE = Number(VITE_MAX_CHUNK_SIZE) || 8192;

interface UploadFlowSagaParams {
    buffer: ArrayBuffer;
    sessionId: string;
}

function* uploadFlowSaga({ buffer, sessionId }: UploadFlowSagaParams) {
    const chunksCount = Math.ceil(buffer.byteLength / MAX_CHUNK_SIZE);

    for (let chunkNumber = 0; chunkNumber < chunksCount; chunkNumber++) {
        const chunkStart = chunkNumber * MAX_CHUNK_SIZE;
        const chunkEnd = Math.min(chunkStart + MAX_CHUNK_SIZE, buffer.byteLength);
        const chunkSize = chunkEnd - chunkStart;
        const chunk = buffer.slice(chunkStart, chunkEnd);
        console.log('chunk', chunk);
        yield call(api.post, `/upload/${sessionId}`, chunk, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'x-start-byte': chunkStart,
                'x-size': chunkSize,
            },
        });
    }
}

function* startUploadSaga() {
    yield put(changeStage(Stage.LOADING));
    const candidateIds: string[] = yield select(selectFlowCandidates);
    const videos = [] as Blob[];
    const totalBytesList = [] as number[];
    for (const candidateId of candidateIds) {
        const video: Blob = yield call([videoManager, videoManager.getVideoById], candidateId);
        videos.push(video);
        totalBytesList.push(video.size);
    }

    const videoBase: Gateway.Request.CreateVideo = {
        title: 'title',
        description: 'description',
        duration: 123123,
        totalBytesList,
    };
    const { data: { payload: video } }: AxiosResponse<Gateway.Response.CreateVideo> =
        yield call(api.post, '/create-video', videoBase);

    const flows = video.flows;
    const uploadSagas = [];
    const buffers: ArrayBuffer[] = yield all(
        videos.map(video => call([video, video.arrayBuffer])),
    );
    for (let i = 0; i < flows.length; i++) {
        const sessionId = flows[i].uploadSession?.id;
        if (!sessionId) {
            return;
        }
        const buffer = buffers[i];
        uploadSagas.push(fork(uploadFlowSaga, { buffer, sessionId }));
    }
    yield all(
        uploadSagas
    );
}

export function* sharedRootSaga() {
    yield all([
        takeLatest(startUpload.type, startUploadSaga),
    ]);
}
