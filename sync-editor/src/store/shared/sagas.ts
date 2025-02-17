import { PayloadAction } from '@reduxjs/toolkit';
import { Gateway } from '@stombie/retube-core';
import { all, call, cancel, delay, fork, put, select, take, takeLatest } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import { Task } from 'redux-saga';
import { startUpload } from './actions';
import { changeStage } from '../stage';
import { Stage } from '../../types/app';
import { selectFlowCandidates } from '../flow-candidates/selectors';
import { videoManager } from '../../managers/video-manager/manager';
import { updateCommonStatus, updateFlows } from '../upload/slice';
import api from '../../api';
import { CommonStatus } from '../upload/types';
import { setPlayerUrl } from '../distribution/slice';

const {
    VITE_MAX_CHUNK_SIZE,
    VITE_UPLOAD_DELAY,
    VITE_STATE_POLLING_DELAY,
    VITE_BEFORE_DISTRIBUTION_DELAY,
    VITE_PLAYER_BASE_URL,
} = import.meta.env;

const MAX_CHUNK_SIZE = Number(VITE_MAX_CHUNK_SIZE) || 8192;
const UPLOAD_DELAY = Number(VITE_UPLOAD_DELAY) || 0;
const STATE_POLLING_DELAY = Number(VITE_STATE_POLLING_DELAY) || 5_000;
const BEFORE_DISTRIBUTION_DELAY = Number(VITE_BEFORE_DISTRIBUTION_DELAY) || 0;
const STOP_COMMON_STATUSES = new Set([CommonStatus.BLOCKED, CommonStatus.DISTRIBUTED]);
const PLAYER_BASE_URL = VITE_PLAYER_BASE_URL || 'http://localhost:3000';

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
        yield call(api.post, `/upload/${sessionId}`, chunk, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'x-start-byte': chunkStart,
                'x-size': chunkSize,
            },
        });
        if (UPLOAD_DELAY) {
            yield delay(UPLOAD_DELAY);
        }
    }
}

function* pollVideoState(videoId: string) {
    while (true) {
        const { data: { payload: video } }: AxiosResponse<Gateway.Response.State> = yield call(api.get, `/state/${videoId}`);
        const { flows } = video;
        yield put(updateFlows(flows));
        yield put(updateCommonStatus(video.status as unknown as CommonStatus));
        yield delay(STATE_POLLING_DELAY);
    }
}

function* startUploadSaga() {
    yield put(changeStage(Stage.LOADING));
    try {
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

        const { status, flows } = video;
        yield put(updateFlows(flows));
        yield put(updateCommonStatus(status as unknown as CommonStatus));

        for (let i = 0; i < candidateIds.length; i++) {
            yield call([videoManager, videoManager.transferVideo], candidateIds[i], flows[i].id);
        }

        const uploadSagas = [];
        const buffers: ArrayBuffer[] = yield all(
            videos.map(video => call([video, video.arrayBuffer])),
        );
        for (let i = 0; i < flows.length; i++) {
            const sessionId = flows[i].uploadSession?.id;
            if (!sessionId) {
                throw new Error('No sessionId found');
            }
            const buffer = buffers[i];
            uploadSagas.push(fork(uploadFlowSaga, { buffer, sessionId }));
        }


        yield put(changeStage(Stage.UPLOADING));
        yield all(
            uploadSagas
        );

        const pollVideoStateSaga: Task = yield fork(pollVideoState, video.id);
        while (true) {
            const { payload: commonStatus }: PayloadAction<CommonStatus> =
                yield take(updateCommonStatus.type);
            if (STOP_COMMON_STATUSES.has(commonStatus)) {
                yield cancel(pollVideoStateSaga);
                break;
            }
        }

        if (BEFORE_DISTRIBUTION_DELAY) {
            yield delay(BEFORE_DISTRIBUTION_DELAY);
        }
        yield put(setPlayerUrl(`${PLAYER_BASE_URL}/${video.id}`));
        yield put(changeStage(Stage.DISTRIBUTION));
    } catch (error) {
        yield put(changeStage(Stage.SYNCHRONIZING));
    }
}

export function* sharedRootSaga() {
    yield all([
        takeLatest(startUpload.type, startUploadSaga),
    ]);
}
